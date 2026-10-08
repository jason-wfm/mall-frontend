<template>
  <div class="merchant-employee-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #left>
          <el-button
            v-permissions="{ permission: ['/manage/shop/storeEmployee/add'] }"
            type="primary"
            icon="el-icon-plus"
            @click="openEdit"
          >
            {{ t('添加员工') }}
          </el-button>
        </template>
      </ms-search-box>

      <el-table v-loading="listLoading" :data="items" :height="height" border>
        <el-table-column prop="employee_id" :label="t('员工编号')" width="100" />
        <el-table-column prop="store_id" :label="t('店铺编号')" width="110" />
        <el-table-column prop="merchant_id" :label="t('所属商家编号')" width="120" />
        <el-table-column prop="user_id" :label="t('关联用户编号')" width="120" />
        <el-table-column :label="t('是否管理员')" width="110">
          <template #default="{ row }">
            <el-tag :type="row.employee_is_admin ? 'success' : 'info'">
              {{ row.employee_is_admin ? t('管理员') : t('普通员工') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('客服')" width="90">
          <template #default="{ row }">{{ row.employee_is_kefu ? t('是') : t('否') }}</template>
        </el-table-column>
        <el-table-column prop="employee_login_time" :label="t('最后登录时间')" min-width="170" />
        <el-table-column :label="t('操作')" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permissions="{ permission: ['/manage/shop/storeEmployee/edit'] }"
              type="text"
              @click="openEdit(row)"
            >
              {{ t('编辑') }}
            </el-button>
            <el-button
              v-permissions="{ permission: ['/manage/shop/storeEmployee/remove'] }"
              type="text"
              @click="handleRemove(row)"
            >
              {{ t('删除') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        :current-page="queryForm.page"
        :page-size="queryForm.size"
        :layout="layout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="visible" :title="form.employee_id ? t('编辑员工') : t('添加员工')" width="480px">
      <el-form :model="form" label-width="110px">
        <el-form-item :label="t('店铺编号')" required>
          <el-input-number v-model="form.store_id" :min="1" :disabled="!!form.employee_id" />
        </el-form-item>
        <el-form-item :label="t('关联用户编号')" required>
          <el-input-number v-model="form.user_id" :min="1" />
        </el-form-item>
        <el-form-item :label="t('是否管理员')">
          <el-switch v-model="form.employee_is_admin" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="t('客服')">
          <el-switch v-model="form.employee_is_kefu" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">{{ t('取消') }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">{{ t('保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { doAdd, doEdit, doRemove, getList } from '@/api/merchant/employee'

export default defineComponent({
  name: 'MerchantEmployee',
  setup() {
    const $message = inject('$message')
    const $confirm = inject('$confirm')
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      items: [],
      listLoading: true,
      loading: false,
      visible: false,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: { page: 1, size: 10 },
      form: {
        employee_id: null,
        store_id: 1,
        user_id: null,
        employee_is_admin: 0,
        employee_is_kefu: 0,
      },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await getList(state.queryForm)
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const openEdit = (row) => {
      state.form = row
        ? { ...row }
        : { employee_id: null, store_id: 1, user_id: null, employee_is_admin: 0, employee_is_kefu: 0 }
      state.visible = true
    }

    const handleSave = () => {
      if (!state.form.store_id || !state.form.user_id) {
        $message(t('店铺编号与关联用户编号必填'), 'error')
        return
      }
      state.loading = true
      const request = state.form.employee_id ? doEdit(state.form) : doAdd(state.form)
      request
        .then(({ msg, status }) => {
          if (status === 200) {
            $message(t('保存成功'), 'success')
            state.visible = false
            fetchData()
          } else {
            $message(msg, 'error')
          }
        })
        .finally(() => {
          state.loading = false
        })
    }

    const handleRemove = (row) => {
      $confirm(t('你确定要删除当前项吗'), null, async () => {
        const { msg, status } = await doRemove({ employee_id: row.employee_id })
        status === 200 ? $message(msg, 'success') : $message(msg, 'error')
        await fetchData()
      })
    }

    const handleSizeChange = (size) => {
      state.queryForm.size = size
      fetchData()
    }
    const handleCurrentChange = (page) => {
      state.queryForm.page = page
      fetchData()
    }

    onMounted(fetchData)

    return {
      t,
      ...toRefs(state),
      openEdit,
      handleSave,
      handleRemove,
      handleSizeChange,
      handleCurrentChange,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.merchant-employee-container {
  padding: 0 !important;
  background: $base-color-background !important;
}
</style>

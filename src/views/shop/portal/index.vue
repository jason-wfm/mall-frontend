<template>
  <div class="shop-portal-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #left>
          <el-button
            v-permissions="{ permission: ['/manage/shop/portal/add'] }"
            type="primary"
            icon="el-icon-plus"
            @click="openEdit()"
          >
            {{ t('新增门户') }}
          </el-button>
        </template>
        <template #right>
          <div class="search-item">
            <el-input
              v-model.trim="queryForm.portal_name"
              :placeholder="t('门户名称')"
              clearable
              style="width: 180px"
              @keyup.enter="fetchData"
            />
          </div>
          <div class="search-item">
            <el-button type="primary" icon="el-icon-search" @click="fetchData">{{ t('搜索') }}</el-button>
          </div>
        </template>
      </ms-search-box>

      <el-table v-loading="listLoading" :data="items" :height="height" border>
        <el-table-column prop="portal_id" :label="t('门户ID')" width="90" />
        <el-table-column prop="portal_name" :label="t('门户名称')" min-width="170" show-overflow-tooltip />
        <el-table-column :label="t('类型')" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.portal_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('品牌主色')" width="110" align="center">
          <template #default="{ row }">
            <span
              class="color-dot"
              :style="{ background: row.brand_color || '#14B8A6' }"
            />
            <span class="color-text">{{ row.brand_color || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="store_count" :label="t('聚合门店数')" width="110" align="center" />
        <el-table-column prop="access_count" :label="t('入口数')" width="90" align="center" />
        <el-table-column :label="t('状态')" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-permissions="{ permission: ['/manage/shop/portal/editState'] }"
              :value="row.portal_state === 1"
              active-color="#13ce66"
              @change="handleState(row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('操作')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/edit'] }"
              type="text"
              @click="openEdit(row)"
            >
              {{ t('编辑') }}
            </el-button>
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/remove'] }"
              type="text"
              class="danger-text"
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

    <portal-edit ref="editRef" @fetch-data="fetchData" />
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { doRemove, doEditState, getList } from '@/api/shop/portal'
import PortalEdit from './components/PortalEdit'

export default defineComponent({
  name: 'ShopPortal',
  components: { PortalEdit },
  setup() {
    const $message = inject('$message')
    const $confirm = inject('$confirm')
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      editRef: null,
      items: [],
      listLoading: true,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: { page: 1, size: 10, portal_name: '' },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await getList(state.queryForm)
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const openEdit = (row) => state.editRef.showEdit(row)

    const handleState = (row) => {
      const target = row.portal_state === 1 ? 0 : 1
      const tip =
        target === 0
          ? t('停用后访问该门户入口将回到平台聚合页，确认停用？')
          : t('确认启用该门户？')
      $confirm(tip, null, async () => {
        const { msg, status } = await doEditState({ portal_id: row.portal_id, portal_state: target })
        status === 200 ? $message(msg, 'success') : $message(msg, 'error')
        await fetchData()
      })
    }

    const handleRemove = (row) => {
      $confirm(t('删除门户前需先清空其入口与门店聚合，确认删除？'), null, async () => {
        const { msg, status } = await doRemove({ portal_id: row.portal_id })
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
      fetchData,
      openEdit,
      handleState,
      handleRemove,
      handleSizeChange,
      handleCurrentChange,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.shop-portal-container {
  padding: 0 !important;
  background: $base-color-background !important;
}

.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  border-radius: 3px;
  vertical-align: middle;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.color-text {
  vertical-align: middle;
}

.danger-text {
  color: var(--el-color-danger);
}
</style>

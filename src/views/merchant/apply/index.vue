<template>
  <div class="merchant-apply-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #left>
          <el-button
            v-permissions="{ permission: ['/manage/merchant/apply/audit'] }"
            type="primary"
            icon="el-icon-plus"
            @click="openCreate"
          >
            {{ t('代商家提交') }}
          </el-button>
        </template>
        <template #right>
          <div class="search-item">
            <el-select v-model="queryForm.apply_type" clearable :placeholder="t('申请类型')" style="width: 130px">
              <el-option :label="t('入驻')" :value="10" />
              <el-option :label="t('信息变更')" :value="20" />
              <el-option :label="t('退驻')" :value="30" />
            </el-select>
          </div>
          <div class="search-item">
            <el-select v-model="queryForm.status" clearable :placeholder="t('状态')" style="width: 130px">
              <el-option :label="t('待审核')" :value="10" />
              <el-option :label="t('已通过')" :value="20" />
              <el-option :label="t('已驳回')" :value="30" />
            </el-select>
          </div>
          <div class="search-item">
            <el-input
              v-model.trim="queryForm.apply_name"
              :placeholder="t('申请人')"
              clearable
              style="width: 160px"
              @keyup.enter="fetchData"
            />
          </div>
          <div class="search-item">
            <el-button type="primary" icon="el-icon-search" @click="fetchData">{{ t('搜索') }}</el-button>
          </div>
        </template>
      </ms-search-box>

      <el-table v-loading="listLoading" :data="items" :height="height" border>
        <el-table-column prop="apply_id" :label="t('申请编号')" width="100" />
        <el-table-column prop="apply_name" :label="t('申请人')" width="120" />
        <el-table-column prop="apply_phone" :label="t('联系电话')" width="140" />
        <el-table-column :label="t('商家名称（快照）')" min-width="160">
          <template #default="{ row }">{{ row.merchant_name || parseBase(row).merchant_name || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('申请类型')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.apply_type === 10 ? 'primary' : row.apply_type === 20 ? 'warning' : 'danger'">
              {{ applyTypeText(row.apply_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('状态')" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="audit_remark" :label="t('审核备注')" min-width="140" show-overflow-tooltip />
        <el-table-column prop="ctime" :label="t('申请时间')" width="170" />
        <el-table-column :label="t('操作')" width="170" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="openDetail(row)">{{ t('详情') }}</el-button>
            <el-button
              v-if="row.status === 10"
              v-permissions="{ permission: ['/manage/merchant/apply/audit'] }"
              type="text"
              @click="openAudit(row)"
            >
              {{ t('审核') }}
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

    <apply-audit ref="auditRef" @fetch-data="fetchData" />
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { getList } from '@/api/merchant/apply'
import ApplyAudit from './components/ApplyAudit'

export default defineComponent({
  name: 'MerchantApply',
  components: { ApplyAudit },
  setup() {
    const $message = inject('$message')
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      auditRef: null,
      items: [],
      listLoading: true,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: {
        page: 1,
        size: 10,
        apply_type: null,
        status: null,
        apply_name: '',
      },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await getList(state.queryForm)
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const parseBase = (row) => {
      try {
        const s = JSON.parse(row.snapshot_json || '{}')
        const base = s.base || {}
        // 后端快照键为 camelCase（buildSnapshot），兼容 snake_case
        return {
          merchant_name: base.merchantName || base.merchant_name || '',
          category: base.category || ''
        }
      } catch (e) {
        return {}
      }
    }

    const applyTypeText = (type) => ({ 10: t('入驻'), 20: t('信息变更'), 30: t('退驻') }[type] || '-')
    const statusText = (status) => ({ 10: t('待审核'), 20: t('已通过'), 30: t('已驳回') }[status] || '-')
    const statusType = (status) => ({ 10: 'warning', 20: 'success', 30: 'danger' }[status] || 'info')

    const openDetail = (row) => state.auditRef.showDetail(row)
    const openAudit = (row) => state.auditRef.showAudit(row)
    const openCreate = () => state.auditRef.showCreate()

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
      parseBase,
      applyTypeText,
      statusText,
      statusType,
      openDetail,
      openAudit,
      openCreate,
      handleSizeChange,
      handleCurrentChange,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.merchant-apply-container {
  padding: 0 !important;
  background: $base-color-background !important;
}
</style>

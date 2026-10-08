<template>
  <div class="merchant-audit-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #right>
          <div class="search-item">
            <el-button type="primary" icon="el-icon-refresh" @click="fetchData">{{ t('刷新') }}</el-button>
          </div>
        </template>
      </ms-search-box>

      <el-table v-loading="listLoading" :data="items" :height="height" border>
        <el-table-column prop="apply_id" :label="t('申请编号')" width="100" />
        <el-table-column prop="apply_name" :label="t('申请人')" width="120" />
        <el-table-column prop="apply_phone" :label="t('联系电话')" width="140" />
        <el-table-column :label="t('商家名称（快照）')" min-width="180">
          <template #default="{ row }">{{ row.merchant_name || parseBase(row).merchant_name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="ctime" :label="t('申请时间')" width="170" />
        <el-table-column :label="t('操作')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
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
import { getAuditList } from '@/api/merchant/apply'
import ApplyAudit from '@/views/merchant/apply/components/ApplyAudit'

export default defineComponent({
  name: 'MerchantAudit',
  components: { ApplyAudit },
  setup() {
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      auditRef: null,
      items: [],
      listLoading: true,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: { page: 1, size: 10 },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await getAuditList(state.queryForm)
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const parseBase = (row) => {
      try {
        const s = JSON.parse(row.snapshot_json || '{}')
        const base = s.base || {}
        // 后端快照键为 camelCase（buildSnapshot），兼容 snake_case
        return { merchant_name: base.merchantName || base.merchant_name || '' }
      } catch (e) {
        return {}
      }
    }

    const openAudit = (row) => state.auditRef.showAudit(row)
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
      openAudit,
      handleSizeChange,
      handleCurrentChange,
    }
  },
})
</script>

<style lang="scss" scoped>
.merchant-audit-container {
  padding: 0 !important;
  background: $base-color-background !important;
}
</style>

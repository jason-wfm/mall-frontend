<template>
  <div class="merchant-settlement-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #right>
          <div class="search-item">
            <el-button type="primary" icon="el-icon-refresh" @click="fetchData">{{ t('刷新') }}</el-button>
          </div>
        </template>
      </ms-search-box>

      <el-table v-loading="listLoading" :data="items" :height="height" border>
        <el-table-column prop="settlement_number" :label="t('结算单号')" width="190" />
        <el-table-column prop="store_id" :label="t('店铺编号')" width="100" />
        <el-table-column prop="period_start" :label="t('账期起')" width="170" />
        <el-table-column prop="period_end" :label="t('账期止')" width="170" />
        <el-table-column prop="order_amount" :label="t('订单实付合计')" width="130" align="right" />
        <el-table-column prop="commission_amount" :label="t('平台佣金')" width="110" align="right" />
        <el-table-column prop="refund_amount" :label="t('退款合计')" width="110" align="right" />
        <el-table-column prop="settle_amount" :label="t('应结金额')" width="120" align="right" />
        <el-table-column :label="t('状态')" width="130" fixed="right">
          <template #default="{ row }">
            <el-tag :type="stateType(row.settlement_state)">{{ stateText(row.settlement_state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('操作')" width="110" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.settlement_state === 0"
              v-permissions="{ permission: ['/manage/pay/settlement/confirm'] }"
              type="text"
              @click="handleConfirm(row)"
            >
              {{ t('确认') }}
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
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { doConfirm, getList } from '@/api/merchant/settlement'

export default defineComponent({
  name: 'MerchantSettlement',
  setup() {
    const $message = inject('$message')
    const $confirm = inject('$confirm')
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      items: [],
      listLoading: true,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: { page: 1, size: 10 },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await getList(state.queryForm)
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const stateText = (stateId) => (
      {
        0: t('待商家确认'),
        1: t('已确认待出金'),
        2: t('出金中'),
        3: t('已完成'),
        4: t('已驳回'),
      }[stateId] || '-'
    )
    const stateType = (stateId) => (
      {
        0: 'warning',
        1: 'primary',
        2: 'primary',
        3: 'success',
        4: 'danger',
      }[stateId] || 'info'
    )

    const handleConfirm = (row) => {
      $confirm(t('确认该结算单后金额将进入出金流程，是否继续？'), null, async () => {
        const { msg, status } = await doConfirm({ settlement_id: row.settlement_id })
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
      stateText,
      stateType,
      handleConfirm,
      handleSizeChange,
      handleCurrentChange,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.merchant-settlement-container {
  padding: 0 !important;
  background: $base-color-background !important;
}
</style>

<template>
  <div class="merchant-dashboard-container">
    <el-row :gutter="16">
      <el-col v-for="(card, index) in cards" :key="index" :xs="12" :sm="6">
        <el-card shadow="never" class="le-card metric-card">
          <div class="metric-label">{{ card.label }}</div>
          <div class="metric-value">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="le-card">
          <template #header>{{ t('微信进件状态分布') }}</template>
          <el-table :data="wxApplyRows" size="small" border>
            <el-table-column prop="label" :label="t('状态')" />
            <el-table-column prop="count" :label="t('商家数')" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="le-card">
          <template #header>{{ t('结算汇总（近200单窗口）') }}</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('待确认/出金金额')">
              {{ formatAmount(data.settlement_pending_amount) }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('已完成结算金额')">
              {{ formatAmount(data.settlement_settled_amount) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { getDashboard } from '@/api/merchant/merchant'

export default defineComponent({
  name: 'MerchantDashboard',
  setup() {
    const $message = inject('$message')

    const state = reactive({
      data: {},
      loading: true,
    })

    const fetchData = async () => {
      state.loading = true
      const { data, msg, status } = await getDashboard()
      if (status === 200) {
        state.data = data || {}
      } else {
        $message(msg, 'error')
      }
      state.loading = false
    }

    const cards = computed(() => [
      { label: t('商家总数'), value: state.data.merchant_total ?? '-' },
      { label: t('营业中'), value: state.data.merchant_open ?? '-' },
      { label: t('已冻结'), value: state.data.merchant_frozen ?? '-' },
      { label: t('门店总数'), value: state.data.store_total ?? '-' },
    ])

    const wxApplyRows = computed(() => {
      const dist = state.data.wx_apply_distribution || {}
      const labels = { 0: t('未进件'), 10: t('审核中'), 20: t('已开通'), 30: t('已驳回') }
      return Object.keys(labels).map((key) => ({
        label: labels[key],
        count: dist[key] || 0,
      }))
    })

    const formatAmount = (value) => (value == null ? '-' : `¥${Number(value).toFixed(2)}`)

    onMounted(fetchData)

    return {
      t,
      ...toRefs(state),
      cards,
      wxApplyRows,
      formatAmount,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.metric-card {
  margin-bottom: 16px;

  .metric-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .metric-value {
    margin-top: 8px;
    font-size: 26px;
    font-weight: 600;
  }
}
</style>

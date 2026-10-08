<template>
  <div class="merchant-account-container">
    <el-card shadow="never" class="le-card" v-loading="loading">
      <template #header>{{ t('结算账户与微信进件') }}</template>

      <el-form :model="form" label-width="130px" style="max-width: 640px">
        <el-form-item :label="t('结算账户类型')">
          <el-radio-group v-model="form.settle_account_type">
            <el-radio :label="10">{{ t('对公银行') }}</el-radio>
            <el-radio :label="20">{{ t('对私银行') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('结算账号')">
          <el-input v-model.trim="form.settle_account_no" maxlength="64" />
        </el-form-item>
        <el-form-item :label="t('结算户名')">
          <el-input v-model.trim="form.settle_account_name" maxlength="64" />
        </el-form-item>
        <el-form-item :label="t('开户银行')">
          <el-input v-model.trim="form.settle_bank_name" maxlength="128" />
        </el-form-item>
        <el-form-item
          v-permissions="{ permission: ['/manage/merchant/account/edit'] }"
          label-width="130px"
        >
          <el-button type="primary" :loading="saving" @click="handleSave">{{ t('保存') }}</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <el-descriptions :column="2" border style="max-width: 720px">
        <el-descriptions-item :label="t('商家')">{{ info.merchant_name || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('微信进件状态')">
          <el-tag :type="wxStatusType">{{ wxStatusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('特约商户号')">{{ info.wx_sub_mchid || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('分账比例')">
          {{ info.wx_profit_sharing_ratio != null ? `${info.wx_profit_sharing_ratio}%` : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 16px">
        <el-button
          v-permissions="{ permission: ['/manage/merchant/account/wxApply'] }"
          type="warning"
          plain
          @click="handleWxApply"
        >
          {{ t('发起微信进件') }}
        </el-button>
        <span class="tip">{{ t('微信服务商进件在支付分账批次（P3）开放') }}</span>
      </div>
    </el-card>
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { getInfo, doEdit } from '@/api/merchant/account'

export default defineComponent({
  name: 'MerchantAccount',
  setup() {
    const $message = inject('$message')

    const state = reactive({
      info: {},
      loading: true,
      saving: false,
      form: {
        settle_account_type: 10,
        settle_account_no: '',
        settle_account_name: '',
        settle_bank_name: '',
      },
    })

    const fetchData = async () => {
      state.loading = true
      const { data } = await getInfo()
      state.info = data || {}
      state.form = {
        settle_account_type: state.info.settle_account_type || 10,
        settle_account_no: state.info.settle_account_no || '',
        settle_account_name: state.info.settle_account_name || '',
        settle_bank_name: state.info.settle_bank_name || '',
      }
      state.loading = false
    }

    const handleSave = () => {
      state.saving = true
      doEdit({}, state.form)
        .then(({ msg, status }) => {
          status === 200 ? $message(t('保存成功'), 'success') : $message(msg, 'error')
          fetchData()
        })
        .finally(() => {
          state.saving = false
        })
    }

    const handleWxApply = () => {
      $message(t('微信服务商进件将在支付分账批次（P3）开放'), 'warning')
    }

    const wxStatusText = computed(() => (
      {
        0: t('未进件'),
        10: t('审核中'),
        20: t('已开通'),
        30: t('已驳回'),
      }[state.info.wx_apply_status] || t('未进件')
    ))
    const wxStatusType = computed(() => (
      {
        0: 'info',
        10: 'warning',
        20: 'success',
        30: 'danger',
      }[state.info.wx_apply_status] || 'info'
    ))

    onMounted(fetchData)

    return {
      t,
      ...toRefs(state),
      handleSave,
      handleWxApply,
      wxStatusText,
      wxStatusType,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.tip {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

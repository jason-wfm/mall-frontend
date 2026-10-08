<template>
  <div class="merchant-profile-container">
    <el-card shadow="never" class="le-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('我的商家资料') }}</span>
          <el-button
            v-permissions="{ permission: ['/manage/merchant/apply/submit'] }"
            type="primary"
            size="small"
            @click="openChange"
          >
            {{ t('提交资料变更') }}
          </el-button>
        </div>
      </template>

      <el-descriptions v-loading="loading" :column="2" border>
        <el-descriptions-item :label="t('商家编号')">{{ info.merchant_id }}</el-descriptions-item>
        <el-descriptions-item :label="t('状态')">{{ statusText(info.status) }}</el-descriptions-item>
        <el-descriptions-item :label="t('商家名称')">{{ info.merchant_name }}</el-descriptions-item>
        <el-descriptions-item :label="t('主营类目')">{{ info.category || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('联系人')">{{ info.contact_name || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('联系电话')">{{ info.contact_phone || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('在途变更单')">
          <el-tag v-if="inflightApply" type="warning">{{ t('有变更单审核中') }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-dialog v-model="visible" :title="t('提交资料变更单')" width="560px" :close-on-click-modal="false">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="t('商家名称')" required>
          <el-input v-model.trim="form.merchant_name" maxlength="64" />
        </el-form-item>
        <el-form-item :label="t('主营类目')">
          <el-input v-model.trim="form.category" maxlength="64" />
        </el-form-item>
        <el-form-item :label="t('联系人')">
          <el-input v-model.trim="form.contact_name" maxlength="32" />
        </el-form-item>
        <el-form-item :label="t('联系电话')" required>
          <el-input v-model.trim="form.contact_phone" maxlength="20" />
        </el-form-item>
        <el-form-item :label="t('商家简介')">
          <el-input v-model.trim="form.intro" type="textarea" :rows="2" />
        </el-form-item>
        <el-alert :title="t('变更单审核通过前，现有资料不受影响')" type="info" :closable="false" />
      </el-form>
      <template #footer>
        <el-button @click="visible = false">{{ t('取消') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('提交') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { translate as t } from '@/i18n'
import { getInfo as getMerchantInfo } from '@/api/merchant/merchant'
import { doSubmit } from '@/api/merchant/apply'

export default defineComponent({
  name: 'MerchantProfile',
  setup() {
    const $message = inject('$message')

    const state = reactive({
      info: {},
      loading: true,
      visible: false,
      submitting: false,
      inflightApply: false,
      form: {
        merchant_name: '',
        category: '',
        contact_name: '',
        contact_phone: '',
        intro: '',
      },
    })

    const fetchData = async () => {
      state.loading = true
      const { data } = await getMerchantInfo()
      state.info = data || {}
      state.form = {
        merchant_name: state.info.merchant_name || '',
        category: state.info.category || '',
        contact_name: state.info.contact_name || '',
        contact_phone: state.info.contact_phone || '',
        intro: state.info.intro || '',
      }
      state.loading = false
    }

    const openChange = () => {
      state.visible = true
    }

    const handleSubmit = () => {
      if (!state.form.merchant_name || !state.form.contact_phone) {
        $message(t('商家名称、联系电话为必填项'), 'error')
        return
      }
      state.submitting = true
      doSubmit(state.form)
        .then(({ msg, status }) => {
          if (status === 200) {
            $message(t('变更单已提交，等待平台审核'), 'success')
            state.visible = false
            state.inflightApply = true
          } else {
            $message(msg, 'error')
          }
        })
        .finally(() => {
          state.submitting = false
        })
    }

    const statusText = (status) => (
      {
        10: t('待提交'),
        20: t('待审核'),
        30: t('已驳回'),
        40: t('营业中'),
        50: t('已冻结'),
        60: t('已退驻'),
      }[status] || '-'
    )

    onMounted(fetchData)

    return {
      t,
      ...toRefs(state),
      openChange,
      handleSubmit,
      statusText,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

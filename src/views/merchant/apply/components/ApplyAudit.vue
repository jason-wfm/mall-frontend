<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="720px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <!-- 代商家提交 -->
    <el-form v-if="mode === 'create'" ref="formRef" :model="form" label-width="110px">
      <el-form-item :label="t('商家名称')" required>
        <el-input v-model.trim="form.merchant_name" maxlength="64" />
      </el-form-item>
      <el-form-item :label="t('主营类目')">
        <el-input v-model.trim="form.category" maxlength="64" />
      </el-form-item>
      <el-form-item :label="t('联系人')" required>
        <el-input v-model.trim="form.contact_name" maxlength="32" />
      </el-form-item>
      <el-form-item :label="t('联系电话')" required>
        <el-input v-model.trim="form.contact_phone" maxlength="20" />
      </el-form-item>
      <el-form-item :label="t('营业执照URL')" required>
        <el-input v-model.trim="form.business_license" :placeholder="t('经上传组件获得，此处可直接粘贴URL')" />
      </el-form-item>
      <el-form-item :label="t('资质图片URL')">
        <el-input v-model.trim="form.qualification_urls" :placeholder="t('多个用英文逗号分隔')" />
      </el-form-item>
      <el-form-item :label="t('商家简介')">
        <el-input v-model.trim="form.intro" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>

    <!-- 详情 / 审核 -->
    <template v-else>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('申请编号')">{{ row.apply_id }}</el-descriptions-item>
        <el-descriptions-item :label="t('申请类型')">{{ applyTypeText(row.apply_type) }}</el-descriptions-item>
        <el-descriptions-item :label="t('申请人')">{{ row.apply_name }}</el-descriptions-item>
        <el-descriptions-item :label="t('联系电话')">{{ row.apply_phone }}</el-descriptions-item>
        <el-descriptions-item :label="t('商家名称')">{{ base.merchant_name || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('主营类目')">{{ base.category || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('营业执照')" :span="2">
          <el-image
            v-if="base.business_license || row.business_license"
            :src="base.business_license || row.business_license"
            :preview-src-list="[base.business_license || row.business_license]"
            fit="cover"
            style="width: 80px; height: 80px"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('资质影像')" :span="2">
          <el-image
            v-for="(url, index) in qualificationUrls"
            :key="index"
            :src="url"
            :preview-src-list="qualificationUrls"
            fit="cover"
            style="width: 80px; height: 80px; margin-right: 8px"
          />
          <span v-if="!qualificationUrls.length">-</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="row.audit_remark" :label="t('审核备注')" :span="2">
          {{ row.audit_remark }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form v-if="mode === 'audit'" style="margin-top: 16px" label-width="80px">
        <el-form-item :label="t('审核结果')">
          <el-radio-group v-model="auditForm.passed">
            <el-radio :label="true">{{ t('通过') }}</el-radio>
            <el-radio :label="false">{{ t('驳回') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.passed === false" :label="t('驳回原因')" required>
          <el-input v-model.trim="auditForm.audit_remark" type="textarea" :rows="2" maxlength="255" />
        </el-form-item>
      </el-form>
    </template>

    <template #footer>
      <el-button @click="visible = false">{{ t('取消') }}</el-button>
      <el-button
        v-if="mode === 'create'"
        type="primary"
        :loading="loading"
        @click="handleCreate"
      >
        {{ t('提交') }}
      </el-button>
      <el-button
        v-if="mode === 'audit'"
        type="primary"
        :loading="loading"
        @click="handleAudit"
      >
        {{ t('确认') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { translate as t } from '@/i18n'
import { doAudit, doSubmit } from '@/api/merchant/apply'

export default defineComponent({
  name: 'MerchantApplyAudit',
  emits: ['fetch-data'],
  setup(props, { emit }) {
    const $message = inject('$message')

    const state = reactive({
      visible: false,
      title: '',
      mode: 'detail',
      loading: false,
      row: {},
      form: {
        merchant_name: '',
        category: '',
        contact_name: '',
        contact_phone: '',
        business_license: '',
        qualification_urls: '',
        intro: '',
      },
      auditForm: {
        apply_id: null,
        passed: true,
        audit_remark: '',
      },
    })

    const base = computed(() => {
      try {
        const s = JSON.parse(state.row.snapshot_json || '{}')
        const b = s.base || {}
        const lic = s.license || {}
        // 后端快照键为 camelCase（buildSnapshot），兼容 snake_case
        return {
          merchant_name: b.merchantName || b.merchant_name || '',
          category: b.category || '',
          business_license: lic.businessLicense || lic.business_license || state.row.business_license || ''
        }
      } catch (e) {
        return { merchant_name: '', category: '', business_license: state.row.business_license || '' }
      }
    })
    const license = computed(() => {
      try {
        return JSON.parse(state.row.snapshot_json || '{}').license || {}
      } catch (e) {
        return {}
      }
    })
    const qualificationUrls = computed(() => {
      const raw = license.value.qualificationUrls || license.value.qualification_urls || ''
      return String(raw)
        .split(',')
        .filter((item) => !!item)
    })

    const showDetail = (row) => {
      state.mode = 'detail'
      state.title = t('申请详情')
      state.row = row
      state.visible = true
    }
    const showAudit = (row) => {
      state.mode = 'audit'
      state.title = t('入驻审核')
      state.row = row
      state.auditForm = { apply_id: row.apply_id, passed: true, audit_remark: '' }
      state.visible = true
    }
    const showCreate = () => {
      state.mode = 'create'
      state.title = t('代商家提交入驻')
      state.form = {
        merchant_name: '',
        category: '',
        contact_name: '',
        contact_phone: '',
        business_license: '',
        qualification_urls: '',
        intro: '',
      }
      state.visible = true
    }

    const handleCreate = () => {
      if (!state.form.merchant_name || !state.form.contact_phone || !state.form.business_license) {
        $message(t('商家名称、联系电话、营业执照为必填项'), 'error')
        return
      }
      state.loading = true
      doSubmit(state.form)
        .then(({ msg, status }) => {
          if (status === 200) {
            $message(t('提交成功，等待平台审核'), 'success')
            state.visible = false
            emit('fetch-data')
          } else {
            $message(msg, 'error')
          }
        })
        .finally(() => {
          state.loading = false
        })
    }

    const handleAudit = () => {
      if (state.auditForm.passed === false && !state.auditForm.audit_remark) {
        $message(t('驳回必须填写原因'), 'error')
        return
      }
      state.loading = true
      doAudit(state.auditForm)
        .then(({ msg, status }) => {
          if (status === 200) {
            $message(t('审核完成'), 'success')
            state.visible = false
            emit('fetch-data')
          } else {
            $message(msg, 'error')
          }
        })
        .finally(() => {
          state.loading = false
        })
    }

    const handleClosed = () => {
      state.row = {}
    }

    const applyTypeText = (type) => ({ 10: t('入驻'), 20: t('信息变更'), 30: t('退驻') }[type] || '-')

    return {
      t,
      ...toRefs(state),
      base,
      qualificationUrls,
      applyTypeText,
      showDetail,
      showAudit,
      showCreate,
      handleCreate,
      handleAudit,
      handleClosed,
      $message,
    }
  },
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.portal_id ? t('编辑门户') : t('新增门户')"
    width="760px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <!-- 分区一：基础信息 -->
    <p class="section-title">{{ t('基础信息') }}</p>
    <el-form :model="form" label-width="100px">
      <el-form-item :label="t('门户名称')" required>
        <el-input v-model.trim="form.portal_name" maxlength="64" style="width: 320px" />
      </el-form-item>
      <el-form-item :label="t('类型')" required>
        <el-radio-group v-model="form.portal_type">
          <el-radio label="PC">PC</el-radio>
          <el-radio label="H5">H5</el-radio>
          <el-radio label="MP">{{ t('小程序') }}</el-radio>
          <el-radio label="APP">APP</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('品牌主色')">
        <el-color-picker v-model="form.brand_color" />
        <span class="color-text">{{ form.brand_color }}</span>
      </el-form-item>
      <el-form-item :label="t('备注')">
        <el-input v-model.trim="form.remark" type="textarea" :rows="2" maxlength="255" />
      </el-form-item>
    </el-form>
    <template v-if="form.portal_id">
      <!-- 分区二：入口管理 -->
      <p class="section-title">{{ t('入口管理') }}</p>
      <el-table :data="detail.accesses || []" size="small" border style="margin-bottom: 8px">
        <el-table-column :label="t('类型')" width="100">
          <template #default="{ row }">{{ row.access_type === 'domain' ? t('域名') : 'APPID' }}</template>
        </el-table-column>
        <el-table-column prop="access_key" :label="t('接入键')" min-width="200" />
        <el-table-column :label="t('默认门店')" width="120">
          <template #default="{ row }">{{ row.store_id || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('操作')" width="90">
          <template #default="{ row }">
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/access'] }"
              type="text"
              class="danger-text"
              @click="handleAccessRemove(row)"
            >
              {{ t('移除') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form :inline="true" size="small">
        <el-form-item :label="t('类型')">
          <el-select v-model="accessForm.access_type" style="width: 110px">
            <el-option label="域名" value="domain" />
            <el-option label="APPID" value="appid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="accessForm.access_key"
            :placeholder="accessForm.access_type === 'domain' ? t('如 mall.health.local') : t('如 wx1234567890abcdef')"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item :label="t('默认门店')">
          <el-select v-model="accessForm.default_store_id" clearable filterable style="width: 200px">
            <el-option v-for="s in storeOptions" :key="s.store_id" :label="`${s.store_id} · ${s.store_name}`" :value="s.store_id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            v-permissions="{ permission: ['/manage/shop/portal/access'] }"
            type="primary"
            :loading="busy"
            @click="handleAccessAdd"
          >
            {{ t('添加入口') }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 分区三：门店聚合 -->
      <p class="section-title">{{ t('门店聚合') }}</p>
      <el-form :inline="true" size="small">
        <el-form-item :label="t('商家')">
          <el-select v-model="storeFilter.merchant_id" clearable filterable :placeholder="t('按商家筛选')" style="width: 200px" @change="loadStores">
            <el-option v-for="m in merchants" :key="m.merchant_id" :label="`${m.merchant_id} · ${m.merchant_name}`" :value="m.merchant_id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('门店')">
          <el-select v-model="storeFilter.store_id" filterable :placeholder="t('仅营业中门店')" style="width: 240px">
            <el-option v-for="s in selectableStores" :key="s.store_id" :label="`${s.store_id} · ${s.store_name}`" :value="s.store_id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            v-permissions="{ permission: ['/manage/shop/portal/store'] }"
            type="primary"
            :loading="busy"
            @click="handleStoreBind"
          >
            {{ t('添加门店') }}
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="detail.stores || []" size="small" border>
        <el-table-column prop="store_id" :label="t('门店ID')" width="90" />
        <el-table-column prop="store_name" :label="t('门店名称')" min-width="160" />
        <el-table-column prop="merchant_name" :label="t('所属商家')" min-width="140" />
        <el-table-column prop="sort" :label="t('排序')" width="70" align="center" />
        <el-table-column :label="t('操作')" width="150">
          <template #default="{ row, $index }">
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/store'] }"
              type="text"
              :disabled="$index === 0"
              @click="handleSort(row, $index, -1)"
            >
              {{ t('上移') }}
            </el-button>
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/store'] }"
              type="text"
              :disabled="$index === (detail.stores || []).length - 1"
              @click="handleSort(row, $index, 1)"
            >
              {{ t('下移') }}
            </el-button>
            <el-button
              v-permissions="{ permission: ['/manage/shop/portal/store'] }"
              type="text"
              class="danger-text"
              @click="handleStoreUnbind(row)"
            >
              {{ t('移除') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template #footer>
      <span v-if="!form.portal_id" class="tip">{{ t('创建后可继续配置入口与门店聚合') }}</span>
      <el-button
        v-permissions="{ permission: ['/manage/shop/portal/add', '/manage/shop/portal/edit'] }"
        type="primary"
        :loading="saving"
        @click="handleSaveBasic"
      >
        {{ form.portal_id ? t('保存基础信息') : t('创建门户') }}
      </el-button>
      <el-button @click="visible = false">{{ t('关闭') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { translate as t } from '@/i18n'
import {
  doAccessAdd,
  doAccessRemove,
  doAdd,
  doEdit,
  doStoreBind,
  doStoreSort,
  doStoreUnbind,
  getInfo,
} from '@/api/shop/portal'
import { getList as getMerchantList } from '@/api/merchant/merchant'
import request from '@/utils/request'
import { URL } from '@/config'

export default defineComponent({
  name: 'PortalEdit',
  emits: ['fetch-data'],
  setup(props, { emit }) {
    const $message = inject('$message')

    const state = reactive({
      visible: false,
      saving: false,
      busy: false,
      form: { portal_id: null, portal_name: '', portal_type: 'H5', brand_color: '#14B8A6', remark: '' },
      detail: {},
      accessForm: { access_type: 'domain', access_key: '', default_store_id: null },
      storeFilter: { merchant_id: null, store_id: null },
      merchants: [],
      storeOptions: [],
    })

    const loadDetail = async () => {
      const { data } = await getInfo({ portal_id: state.form.portal_id })
      state.detail = data || {}
      state.form.portal_name = data.portal_name
      state.form.portal_type = data.portal_type
      state.form.brand_color = data.brand_color
      state.form.remark = data.remark
    }

    const loadMerchants = async () => {
      const { data } = await getMerchantList({ page: 1, size: 100 })
      state.merchants = (data.items || []).filter((m) => m.status === 40)
    }

    const loadStores = async () => {
      const params = { page: 1, size: 200 }
      const { data } = await request({ url: URL.shop.storeBase.list, method: 'get', params })
      // 仅营业中门店；按商家前端过滤（后端 storeBase list 暂无 merchant 过滤参数）
      let items = data.items || []
      if (state.storeFilter.merchant_id) {
        items = items.filter((s) => s.merchant_id === state.storeFilter.merchant_id)
      }
      state.storeOptions = items.filter((s) => s.store_is_open)
    }

    const selectableStores = computed(() =>
      (state.storeOptions || []).filter(
        (s) => !(state.detail.stores || []).some((bound) => bound.store_id === s.store_id)
      )
    )

    const showEdit = async (row) => {
      state.visible = true
      if (row) {
        state.form = { portal_id: row.portal_id, portal_name: row.portal_name, portal_type: row.portal_type, brand_color: row.brand_color || '#14B8A6', remark: row.remark || '' }
        await loadDetail()
      } else {
        state.form = { portal_id: null, portal_name: '', portal_type: 'H5', brand_color: '#14B8A6', remark: '' }
        state.detail = {}
      }
      loadMerchants()
      loadStores()
    }

    const handleSaveBasic = () => {
      if (!state.form.portal_name) {
        $message(t('门户名称为必填项'), 'error')
        return
      }
      state.saving = true
      const req = state.form.portal_id
        ? doEdit(state.form)
        : doAdd(state.form)
      req
        .then(({ msg, status, data }) => {
          if (status === 200) {
            $message(t('保存成功'), 'success')
            if (!state.form.portal_id && data) {
              state.form.portal_id = data
              loadDetail()
            }
            emit('fetch-data')
          } else {
            $message(msg, 'error')
          }
        })
        .finally(() => {
          state.saving = false
        })
    }

    const handleAccessAdd = () => {
      if (!state.accessForm.access_key) {
        $message(t('请填写接入键'), 'error')
        return
      }
      state.busy = true
      doAccessAdd({ ...state.accessForm, portal_id: state.form.portal_id })
        .then(({ msg, status }) => {
          status === 200 ? $message(t('添加成功'), 'success') : $message(msg, 'error')
          if (status === 200) {
            state.accessForm.access_key = ''
            state.accessForm.default_store_id = null
            loadDetail()
          }
        })
        .finally(() => {
          state.busy = false
        })
    }

    const handleAccessRemove = (row) => {
      $confirm(t('确认移除该入口？'), null, async () => {
        const { msg, status } = await doAccessRemove({ access_id: row.access_id })
        status === 200 ? $message(msg, 'success') : $message(msg, 'error')
        await loadDetail()
      })
    }

    const handleStoreBind = () => {
      if (!state.storeFilter.store_id) {
        $message(t('请选择门店'), 'error')
        return
      }
      state.busy = true
      doStoreBind({ portal_id: state.form.portal_id, store_id: state.storeFilter.store_id, sort: (state.detail.stores || []).length })
        .then(({ msg, status }) => {
          status === 200 ? $message(t('聚合成功'), 'success') : $message(msg, 'error')
          if (status === 200) {
            state.storeFilter.store_id = null
            loadDetail()
          }
        })
        .finally(() => {
          state.busy = false
        })
    }

    const handleStoreUnbind = (row) => {
      $confirm(t('确认将该门店移出门户聚合？'), null, async () => {
        const { msg, status } = await doStoreUnbind({ portal_id: state.form.portal_id, store_id: row.store_id })
        status === 200 ? $message(msg, 'success') : $message(msg, 'error')
        await loadDetail()
      })
    }

    const handleSort = (row, index, direction) => {
      const stores = [...(state.detail.stores || [])]
      const target = index + direction
      if (target < 0 || target >= stores.length) return
      const ids = stores.map((s) => s.store_id)
      const tmp = ids[index]
      ids[index] = ids[target]
      ids[target] = tmp
      doStoreSort({ portal_id: state.form.portal_id, store_ids: ids.join(',') }).then(() => loadDetail())
    }

    const handleClosed = () => {
      state.detail = {}
      emit('fetch-data')
    }

    return {
      t,
      ...toRefs(state),
      selectableStores,
      showEdit,
      handleSaveBasic,
      handleAccessAdd,
      handleAccessRemove,
      handleStoreBind,
      handleStoreUnbind,
      handleSort,
      handleClosed,
      $message,
    }
  },
})
</script>

<style lang="scss" scoped>
.section-title {
  margin: 8px 0 10px;
  font-weight: 700;
  font-size: 13px;
  color: var(--el-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
}

.tip {
  margin-right: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.danger-text {
  color: var(--el-color-danger);
}
</style>

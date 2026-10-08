<template>
  <div class="merchant-store-container">
    <el-card shadow="never" class="le-card">
      <ms-search-box>
        <template #right>
          <div class="search-item">
            <el-input
              v-model.trim="queryForm.store_name"
              :placeholder="t('店铺名称')"
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
        <el-table-column prop="store_id" :label="t('店铺编号')" width="100" />
        <el-table-column prop="store_name" :label="t('店铺名称')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="merchant_id" :label="t('所属商家编号')" width="120" />
        <el-table-column :label="t('营业状态')" width="110">
          <template #default="{ row }">
            <el-tag :type="row.store_is_open ? 'success' : 'info'">
              {{ row.store_is_open ? t('运营中') : t('已关闭') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('资料状态')" width="130">
          <template #default="{ row }">{{ stateText(row.store_state_id) }}</template>
        </el-table-column>
        <el-table-column prop="store_type" :label="t('店铺类型')" width="110">
          <template #default="{ row }">{{ row.store_type === 1 ? t('卖家店铺') : t('供应商店铺') }}</template>
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
import request from '@/utils/request'
import { URL } from '@/config'

export default defineComponent({
  name: 'MerchantStore',
  setup() {
    const $tableHeight = inject('$tableHeight')

    const state = reactive({
      items: [],
      listLoading: true,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: $tableHeight(),
      queryForm: { page: 1, size: 10, store_name: '' },
    })

    const fetchData = async () => {
      state.listLoading = true
      const { data } = await request({ url: URL.shop.storeBase.list, method: 'get', params: state.queryForm })
      state.items = data.items || []
      state.total = data.records || 0
      state.listLoading = false
    }

    const stateText = (stateId) => (
      {
        3210: t('待完善资料'),
        3220: t('等待审核'),
        3230: t('审核未通过'),
        3250: t('已开通'),
      }[stateId] || stateId || '-'
    )

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
      handleSizeChange,
      handleCurrentChange,
    }
  },
})
</script>

<style lang="scss" scoped>
.merchant-store-container {
  padding: 0 !important;
  background: $base-color-background !important;
}
</style>

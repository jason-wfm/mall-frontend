import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({
    url: URL.merchant.base.list,
    method: 'get',
    params,
  })
}

export function getInfo(params) {
  return request({
    url: URL.merchant.base.info,
    method: 'get',
    params,
  })
}

export function editState(data) {
  return request({
    url: URL.merchant.base.editState,
    method: 'post',
    data,
  })
}

export function getDashboard(params) {
  return request({
    url: URL.merchant.dashboard.list,
    method: 'get',
    params,
  })
}

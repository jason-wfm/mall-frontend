import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({
    url: URL.merchant.settlement.list,
    method: 'get',
    params,
  })
}

export function getInfo(params) {
  return request({
    url: URL.merchant.settlement.get,
    method: 'get',
    params,
  })
}

export function doConfirm(params) {
  return request({
    url: URL.merchant.settlement.confirm,
    method: 'post',
    params,
  })
}

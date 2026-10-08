import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({
    url: URL.shop.storeEmployee.list,
    method: 'get',
    params,
  })
}

export function doAdd(data) {
  return request({
    url: URL.shop.storeEmployee.add,
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: URL.shop.storeEmployee.edit,
    method: 'post',
    data,
  })
}

export function doRemove(data) {
  return request({
    url: URL.shop.storeEmployee.remove,
    method: 'post',
    data,
  })
}

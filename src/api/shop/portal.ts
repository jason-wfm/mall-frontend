import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({
    url: URL.shop.portal.list,
    method: 'get',
    params,
  })
}

export function getInfo(params) {
  return request({
    url: URL.shop.portal.info,
    method: 'get',
    params,
  })
}

export function doAdd(data) {
  return request({
    url: URL.shop.portal.add,
    method: 'post',
    data,
  })
}

export function doEdit(data) {
  return request({
    url: URL.shop.portal.edit,
    method: 'post',
    data,
  })
}

export function doEditState(params) {
  return request({
    url: URL.shop.portal.editState,
    method: 'post',
    params,
  })
}

export function doRemove(params) {
  return request({
    url: URL.shop.portal.remove,
    method: 'post',
    params,
  })
}

export function doAccessAdd(data) {
  return request({
    url: URL.shop.portal.accessAdd,
    method: 'post',
    data,
  })
}

export function doAccessRemove(params) {
  return request({
    url: URL.shop.portal.accessRemove,
    method: 'post',
    params,
  })
}

export function doStoreBind(data) {
  return request({
    url: URL.shop.portal.storeBind,
    method: 'post',
    data,
  })
}

export function doStoreUnbind(params) {
  return request({
    url: URL.shop.portal.storeUnbind,
    method: 'post',
    params,
  })
}

export function doStoreSort(params) {
  return request({
    url: URL.shop.portal.storeSort,
    method: 'post',
    params,
  })
}

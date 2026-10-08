import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({
    url: URL.merchant.apply.list,
    method: 'get',
    params,
  })
}

export function getAuditList(params) {
  return request({
    url: URL.merchant.apply.auditList,
    method: 'get',
    params,
  })
}

export function getInfo(params) {
  return request({
    url: URL.merchant.apply.info,
    method: 'get',
    params,
  })
}

export function doAudit(data) {
  return request({
    url: URL.merchant.apply.audit,
    method: 'post',
    data,
  })
}

export function doSubmit(data) {
  return request({
    url: URL.merchant.apply.submit,
    method: 'post',
    data,
  })
}

export function doResubmit(params, data) {
  return request({
    url: URL.merchant.apply.resubmit,
    method: 'post',
    params,
    data,
  })
}

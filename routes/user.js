const express=require('express')
const auth=require('./auth')
const userController=require('../controllers/user')
const router=express.Router()

// 회원가입
router.post('/',userController.create);
// 이메일 검증
router.post('/emailvalid',userController.emailVarlid)
// 계정 검증
router.post('/accountnamevalid',userController.accountnameVarlid)
// 로그인
router.post('/login',userController.login);
// 회원 목록
router.get('/', userController.list);

// 토큰 검증
router.use(auth.required);
// 회원 정보 수정
router.put('/',userController.update);
// 회원 정보 삭제(구현 완료되지 않음)
router.delete('/',userController.userdelete);
// 계정, 유저이름 검색
router.get('/searchuser',userController.searchUser);
// 리프레쉬 토큰 검증
router.post('/refresh',userController.refreshAuth);

module.exports = router;
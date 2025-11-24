<template>
	<view class="register-container">
		<!-- 背景渐变 -->
		<view class="background-gradient"></view>
		
		<!-- 注册卡片 -->
		<view class="register-card">
			<!-- 标题 -->
			<view class="register-title">骑手注册</view>
			
			<!-- 表单区域 -->
			<view class="form-container">
				<!-- 手机号输入 -->
				<view class="input-group">
					<text class="input-label">手机号</text>
					<input 
						class="input-field" 
						type="number" 
						v-model="phoneNumber" 
						placeholder="请输入手机号"
						maxlength="11"
					/>
				</view>
				
				<!-- 设置密码输入 -->
				<view class="input-group">
					<text class="input-label">设置密码</text>
					<input 
						class="input-field" 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码"
					/>
					
				</view>
				
				<!-- 确认密码输入 -->
				<view class="input-group">
					<text class="input-label">确认密码</text>
					<input 
						class="input-field" 
						:type="showConfirmPassword ? 'text' : 'password'" 
						v-model="confirmPassword" 
						placeholder="请确认密码"
					/>
					
				</view>
				
				<!-- 验证码输入 -->
			<view class="input-group">
				<text class="input-label">验证码</text>
				<view class="verification-code-container">
					<input 
						class="verification-input" 
						type="text" 
						v-model="verificationCode" 
						placeholder="请输入验证码"
						maxlength="6"
					/>
					<view class="captcha-container">
						<image 
							:src="captchaImage" 
							class="captcha-image" 
							@click="refreshCaptcha"
							mode="aspectFit"
						/>
					</view>
				</view>
			</view>
				
				<!-- 按钮区域 -->
				<view class="button-group">
					<button class="register-btn" @click="handleRegister">注册</button>
					<button class="login-btn" @click="handleLogin">返回登录</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { registerRider, getCaptcha } from '../../utils/api.js';

export default {
	data() {
		return {
			phoneNumber: '',
			password: '',
			confirmPassword: '',
			verificationCode: '',
			showPassword: false,
			showConfirmPassword: false,
			captchaImage: '/static/c1.png', // 验证码图片URL
			uuid: '' // 验证码UUID
		}
	},
	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		// 切换确认密码显示
		toggleConfirmPassword() {
			this.showConfirmPassword = !this.showConfirmPassword
		},
		
		// 页面加载时获取验证码
		onLoad() {
			this.refreshCaptcha();
		},
		
		// 刷新验证码
		async refreshCaptcha() {
			// 首先使用静态验证码确保页面有验证码显示
			this.setStaticCaptcha();
			
			// 然后尝试从服务器获取验证码
			try {
				const result = await getCaptcha();
				console.log('验证码响应:', result);

				if (result.img) {
					// 获取uuid并保存
					this.uuid = result.uuid;
					uni.setStorageSync('captchaUuid', result.uuid);
					
					// 显示Base64图片
					this.captchaImage = 'data:image/jpeg;base64,' + result.img;
					console.log('服务器验证码加载成功');
				} else {
					console.log('服务器验证码返回错误或无图片');
					// 保持使用静态验证码
				}
			} catch (error) {
				console.error('获取服务器验证码失败:', error);
				// 保持使用静态验证码
			}
		},
		
		// 设置静态验证码
		setStaticCaptcha() {
			const randomNum = Math.floor(Math.random() * 9) + 1;
			const staticCaptchaPath = `/static/c${randomNum}.png?timestamp=${Date.now()}`;
			this.captchaImage = staticCaptchaPath;
			// 生成临时uuid
			this.uuid = 'temp_' + Date.now();
			uni.setStorageSync('captchaUuid', this.uuid);
			console.log('使用静态验证码:', staticCaptchaPath);
		},
		
		// 统一消息提示方法
		showMessage(title, icon = 'none') {
			uni.showToast({
				title,
				icon
			});
		},
		
		// 处理注册
		async handleRegister() {
			if (!this.validateForm()) {
				return
			}
			
			try {
				// 调用骑手注册API
				const result = await registerRider(
					this.phoneNumber,
					this.password,
					this.verificationCode,
					this.uuid || uni.getStorageSync('captchaUuid')
				);
				
				console.log('注册响应:', result);
				
				// 注册成功
				this.showMessage('注册成功', 'success');
				
				// 跳转到登录页面
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
						fail: () => {
							// 如果无法返回，则跳转到登录页
							uni.redirectTo({
								url: '/pages/login/login',
								fail: () => {
									uni.reLaunch({ url: '/pages/login/login' });
								}
							});
						}
					});
				}, 1500);
				
			} catch (error) {
				console.error('注册失败:', error);
				this.showMessage(error.message || '注册失败', 'none');
				// 刷新验证码
				this.refreshCaptcha();
			}
		},
		
		// 处理返回登录
		handleLogin() {
			uni.navigateBack({
				delta: 1,
				fail: () => {
					// 如果无法返回，则跳转到登录页
					uni.redirectTo({
						url: '/pages/login/login',
						fail: () => {
							uni.reLaunch({ url: '/pages/login/login' });
						}
					});
				}
			});
		},
		
		// 表单验证
		validateForm() {
			if (!this.phoneNumber) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return false
			}
			
			if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return false
			}
			
			if (!this.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return false
			}
			
			if (this.password.length < 6) {
				uni.showToast({
					title: '密码长度不能少于6位',
					icon: 'none'
				})
				return false
			}
			
			if (!this.confirmPassword) {
				uni.showToast({
					title: '请确认密码',
					icon: 'none'
				})
				return false
			}
			
			if (this.password !== this.confirmPassword) {
				uni.showToast({
					title: '两次输入的密码不一致',
					icon: 'none'
				})
				return false
			}
			
			if (!this.verificationCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				})
				return false
			}
			

			
			return true
		}
	}
}</script>

<style lang="scss" scoped>
.register-container {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	/* 添加flex布局使内容居中 */
	display: flex;
	align-items: center;
	justify-content: center;
}

.background-gradient {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/* 修改为浅蓝色渐变 */
	background: linear-gradient(180deg, #e6f4fb 0%, #b6e0f8 100%);
	z-index: 1;
}

.register-card {
	position: relative;
	z-index: 2;
	/* 缩小卡片宽度 */
	width: 75%;
	/* 减小最大宽度 */
	max-width: 320px;
	/* 移除margin，使用flex布局居中 */
	/* margin: 8% auto 0; */
	background: white;
	border-radius: 24px;
	padding: 35px 25px;
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.register-title {
	font-size: 24px;
	font-weight: bold;
	color: #87CEEB;
	text-align: center;
	margin-bottom: 30px;
}

.form-container {
	width: 100%;
}

.input-group {
	margin-bottom: 15px;
	position: relative;
}

.input-label {
	display: block;
	font-size: 16px;
	color: #87CEEB;
	margin-bottom: 8px;
	font-weight: 500;
}

.input-field {
	width: 100%;
	/* 调整输入框高度 */
	height: 50px;
	border: 2px solid #E0F0FB;
	border-radius: 12px;
	padding: 0 15px;
	font-size: 15px;
	background: white;
	box-sizing: border-box;
	transition: border-color 0.3s ease;
	
	&:focus {
		border-color: #87CEEB;
		outline: none;
	}
}

.password-toggle {
	position: absolute;
	right: 15px;
	top: 34px;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.toggle-icon {
	font-size: 18px;
	color: #87CEEB;
}

.picker-field {
	width: 100%;
}

.picker-display {
	width: 100%;
	/* 调整选择器高度 */
	height: 50px;
	border: 2px solid #E0F0FB;
	border-radius: 12px;
	padding: 0 15px;
	background: white;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	transition: border-color 0.3s ease;
}

.picker-text {
	font-size: 15px;
	color: #333;
}

.picker-arrow {
	font-size: 12px;
	color: #87CEEB;
}

.verification-container {
	display: flex;
	gap: 10px;
	align-items: center;
}

.verification-input {
	flex: 1;
	/* 调整验证码输入框高度 */
	height: 50px;
	border: 2px solid #E0F0FB;
	border-radius: 12px;
	padding: 0 15px;
	font-size: 15px;
	background: white;
	box-sizing: border-box;
	transition: border-color 0.3s ease;
	
	&:focus {
		border-color: #87CEEB;
		outline: none;
	}
}

/* 验证码容器样式 */
.verification-code-container {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-direction: row;
}

/* 验证码输入框样式 */
.verification-input {
	flex: 1;
	height: 50px;
	border: 2px solid #E0F0FB;
	border-radius: 12px;
	padding: 0 15px;
	font-size: 15px;
	background: white;
	box-sizing: border-box;
	transition: border-color 0.3s ease;
}

.verification-input:focus {
	border-color: #87CEEB;
	outline: none;
}

/* 验证码图片容器样式 */
.captcha-container {
	width: 120px;
	height: 50px;
	border-radius: 12px;
	overflow: hidden;
	background-color: #f5f5f5;
}

.captcha-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	cursor: pointer;
}

.verification-btn {
	/* 调整获取验证码按钮样式 */
	width: 120px;
	height: 50px;
	/* 修改为纯色背景 */
	background: #87CEEB;
	color: white;
	border: none;
	border-radius: 12px;
	font-size: 13px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	
	&:active {
		transform: scale(0.98);
		background: #73c6e3;
	}
	
	&:disabled {
		background: #ccc;
		color: #999;
	}
}

.button-group {
	/* 修改为垂直排列按钮 */
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 30px 0 15px 0;
}

.register-btn {
	width: 100%;
	/* 调整注册按钮高度 */
	height: 50px;
	/* 修改为纯色背景 */
	background: #87CEEB;
	color: white;
	border: none;
	border-radius: 12px;
	font-size: 16px;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	
	&:active {
		transform: scale(0.98);
		background: #73c6e3;
	}
}

.login-btn {
	width: 100%;
	/* 调整返回登录按钮高度 */
	height: 50px;
	background: white;
	color: #87CEEB;
	/* 调整边框样式 */
	border: 2px solid #87CEEB;
	border-radius: 12px;
	font-size: 15px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	
	&:active {
		background: #87CEEB;
		color: white;
	}
}

/* 手机端优化 */
@media screen and (max-width: 480px) {
	.register-card {
		width: 92%;
		margin: 5% auto 0;
		padding: 30px 20px;
		border-radius: 20px;
	}
	
	.register-title {
		font-size: 22px;
		margin-bottom: 25px;
	}
	
	.input-group {
		margin-bottom: 20px;
	}
	
	.input-field, .picker-display, .verification-input {
		height: 48px;
		font-size: 14px;
		border-radius: 10px;
	}
	
	.verification-btn {
		height: 48px;
		font-size: 12px;
		width: 110px;
		border-radius: 10px;
	}
	
	.register-btn, .login-btn {
		height: 48px;
		font-size: 15px;
		border-radius: 10px;
	}
	
	/* 移动端保持验证码区域为水平布局 */
	.verification-container {
		flex-direction: row;
		gap: 10px;
	}
	
	.verification-btn {
		width: 110px;
	}
	
	.button-group {
		gap: 12px;
		margin: 25px 0 15px 0;
	}
}
</style>

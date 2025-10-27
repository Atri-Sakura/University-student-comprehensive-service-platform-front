<template>
	<view class="login-container">
		<!-- 背景颜色 -->
		<view class="background-gradient"></view>
		
		<!-- 登录卡片 -->
		<view class="login-card">
			<!-- 标题 -->
			<view class="login-title">欢迎登录</view>
			
			<!-- 表单区域 -->
			<view class="form-container">
				<!-- 身份选择 -->
				<view class="input-group">
					<text class="input-label">请选择登录身份</text>
					<picker 
						:value="identityIndex" 
						:range="identityOptions" 
						@change="onIdentityChange"
						class="picker-field"
					>
						<view class="picker-display">
							<text class="picker-text">{{ identityOptions[identityIndex] || '请选择登录身份' }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
				
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
				
				<!-- 密码输入 -->
				<view class="input-group">
					<text class="input-label">密码</text>
					<input 
						class="input-field" 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码"
					/>
					
					
					
				</view>
				
				<!-- 验证码输入 -->
				<view class="input-group">
					<text class="input-label">验证码</text>
					<view class="verification-code-container">
						<input 
							class="input-field verification-input" 
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
					<button class="login-btn" @click="handleLogin">登录</button>
					<button class="register-btn" @click="handleRegister">注册</button>
				</view>
				
				<!-- 辅助功能 -->
				<view class="helper-links">
					<text class="helper-link" @click="handleSmsLogin">短信验证码登录</text>
					<text class="helper-link" @click="handleForgotPassword">忘记密码</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// 导入API配置
import { request } from '../../utils/api.js';

// 配置API基础URL
const API_BASE_URL = 'http://localhost:8080';

export default {
	data() {
			return {
				phoneNumber: '',
				password: '',
				showPassword: false,
				verificationCode: '', // 验证码
				captchaImage: '', // 验证码图片URL
				uuid: '', // 验证码UUID
			identityIndex: 0,
			identityOptions: ['学生', '骑手', '商家'],
			// 身份映射，用于匹配API配置中的key
			identityMap: {
				'学生': 'student',
				'骑手': 'rider',
				'商家': 'merchant'
			}
		}
	},
	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		// 身份选择变化
		onIdentityChange(e) {
			this.identityIndex = e.detail.value
		},
		
		// 页面加载时获取验证码
		onLoad() {
			this.refreshCaptcha();
		},
		
		// 显示消息
		showMessage(message, type) {
			const icon = type === 'error' ? 'none' : 'success';
			uni.showToast({
				title: message,
				icon: icon,
				duration: 3000
			});
		},
		
		// 处理登录
		async handleLogin() {
			if (!this.validateForm()) {
				return
			}
			
			// 显示加载提示
			uni.showLoading({
				title: '登录中...'
			})
			
			// 根据身份选择不同的登录接口
			const identityName = this.identityOptions[this.identityIndex];
			const identityKey = this.identityMap[identityName];
			
			let loginUrl = '';
			switch(identityKey) {
				case 'student':
					loginUrl = `${API_BASE_URL}/platform/auth/user/login`;
					break;
				case 'rider':
					loginUrl = `${API_BASE_URL}/platform/auth/rider/login`;
					break;
				case 'merchant':
					loginUrl = `${API_BASE_URL}/platform/auth/merchant/login`;
					break;
			}
			
			try {
				const response = await fetch(loginUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						phonenumber: this.phoneNumber,
						password: this.password,
						code: this.verificationCode,
						uuid: this.uuid || uni.getStorageSync('captchaUuid')
					})
				});

				const result = await response.json();
				console.log('登录响应:', result);
				
				uni.hideLoading();

				if (result.code === 200) {
					// 保存token
					uni.setStorageSync('token', result.token);
					uni.setStorageSync('userType', identityKey);
					uni.setStorageSync('identity', identityName);
					uni.setStorageSync('identityKey', identityKey);
					
					this.showMessage('登录成功！', 'success');
					
					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1000);
				} else {
					this.showMessage(result.msg || '登录失败', 'error');
					this.refreshCaptcha();
				}
			} catch (error) {
				uni.hideLoading();
				console.error('登录错误:', error);
				this.showMessage('网络错误，请稍后重试', 'error');
				this.refreshCaptcha();
			}
		},
		
		// 处理注册
		handleRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
			})
		},
		
		// 短信验证码登录
		handleSmsLogin() {
			uni.showToast({
				title: '跳转到短信登录',
				icon: 'none'
			})
			// 这里可以跳转到短信登录页面
		},
		
		// 忘记密码
		handleForgotPassword() {
			uni.showToast({
				title: '跳转到找回密码',
				icon: 'none'
			})
			// 这里可以跳转到找回密码页面
		},
		
		// 刷新验证码
		async refreshCaptcha() {
			// 首先使用静态验证码确保页面有验证码显示
			this.setStaticCaptcha();
			
			// 然后尝试从服务器获取验证码
			try {
				// 根据参考代码，使用正确的验证码接口路径
				console.log('尝试获取服务器验证码');
				const response = await fetch(`${API_BASE_URL}/captchaImage`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const result = await response.json();
				console.log('验证码响应:', result);

				if (result.code === 200 && result.img) {
					// 获取uuid并保存
					this.uuid = result.uuid;
					uni.setStorageSync('captchaUuid', result.uuid);
					
					// 显示Base64图片
					this.captchaImage = 'data:image/jpeg;base64,' + result.img;
					console.log('服务器验证码加载成功');
				} else {
					console.log('服务器验证码返回错误或无图片:', result.msg);
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
		
		// 表单验证
		validateForm() {
			// 验证身份选择
			if (this.identityIndex === undefined || this.identityIndex === null || this.identityIndex < 0) {
				uni.showToast({
					title: '请选择登录身份',
					icon: 'none'
				})
				return false
			}
			
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
					title: '密码至少6位',
					icon: 'none'
				})
				return false
			}
			
			// 验证验证码
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
}
</script>

<style lang="scss" scoped>
.login-container {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	/* 确保背景颜色生效 */
	background: #f0f8ff;
}

.background-gradient {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/* 恢复背景渐变 */
	background: linear-gradient(180deg, #e6f4fb 0%, #b6e0f8 100%);
	z-index: 1;
}

.login-card {
	position: relative;
	z-index: 2;
	/* 使用flex布局容器来实现居中 */
	margin: 0 auto;
	/* 调整卡片宽度 */
	width: 75%;
	max-width: 320px;
	background: white;
	border-radius: 24px;
	padding: 35px 25px;
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
	/* 使用margin-top来调整垂直位置 */
	margin-top: calc(50vh - 350px);
}

/* 其他样式保持不变 */

/* 手机端优化 */
@media screen and (max-width: 480px) {
	.login-card {
		width: 85%;
		max-width: 280px;
		padding: 30px 20px;
		border-radius: 20px;
		margin-top: calc(50vh - 300px);
	}
	
	/* 其他移动端样式保持不变 */
}

.login-title {
    font-size: 20px;
    font-weight: 500;
    color: #333;
    margin-bottom: 25px;
    text-align: center;
}

.form-container {
    width: 100%;
}

.input-group {
    margin-bottom: 20px;
}

.input-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}

.input-field {
    width: 100%;
    height: 44px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 15px;
    font-size: 15px;
    color: #333;
    box-sizing: border-box;
}

/* 验证码相关样式 */
.verification-code-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.verification-input {
    flex: 1;
    margin-bottom: 0;
}

.captcha-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.captcha-image {
    height: 44px;
    width: 120px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f5f5f5;
}

.captcha-image:active {
    opacity: 0.8;
}

.password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
}

.toggle-icon {
    font-size: 18px;
}

.picker-field {
    width: 100%;
}

.picker-display {
    width: 100%;
    height: 44px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 15px;
    font-size: 15px;
    color: #333;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.picker-text {
    flex: 1;
}

.picker-arrow {
    color: #999;
}

.button-group {
    margin-top: 30px;
}

.login-btn {
    width: 100%;
    height: 44px;
    background-color: #87CEEB;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    cursor: pointer;
}

.register-btn {
    width: 100%;
    height: 44px;
    background-color: transparent;
    color: #87CEEB;
    border: 1px solid #87CEEB;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 12px;
    cursor: pointer;
}

.helper-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.helper-link {
    font-size: 13px;
    color: #666;
    text-decoration: none;
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
    .login-card {
        width: 85%;
        max-width: 280px;
        padding: 30px 20px;
        margin-top: calc(50vh - 300px);
    }
    
    .login-title {
        font-size: 18px;
        margin-bottom: 20px;
    }
    
    .input-group {
        margin-bottom: 15px;
    }
    
    .input-field, .picker-display {
        height: 38px;
        font-size: 13px;
    }
    
    .login-btn, .register-btn {
        height: 38px;
        font-size: 15px;
    }
    
    .helper-link {
        font-size: 12px;
    }
}
</style>

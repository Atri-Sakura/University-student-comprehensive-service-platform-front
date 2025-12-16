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
					<view class="password-container">
						<input 
							class="input-field password-input" 
							:type="showPassword ? 'text' : 'password'" 
							v-model="password" 
							placeholder="请输入密码"
						/>
						<view class="password-toggle" @click="togglePassword">
							<text class="toggle-icon">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
						</view>
					</view>
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
			</view>
		</view>
	</view>
</template>

<script>
import http from '@/api/request.js';

export default {
	data() {
		return {
			phoneNumber: '',
			password: '',
			showPassword: false,
			verificationCode: '', // 验证码
			captchaImage: '/static/c1.png', // 验证码图片URL（设置默认值确保页面加载时可见）
			uuid: '' // 验证码UUID
		}
	},
	// 页面创建时获取验证码
	created() {
		this.refreshCaptcha();
	},
	
	// 页面加载时获取验证码（增加兼容性）
	onLoad() {
		// 检查是否是从聊天页刷新后返回的
		const chatRefreshed = sessionStorage.getItem('chatRefreshed');
		if (chatRefreshed === 'true') {
			sessionStorage.removeItem('chatRefreshed');
			uni.reLaunch({
				url: '/pages/message/message'
			});
			return;
		}
		
		// 如果created中没有成功执行或captchaImage仍然为空，则再次尝试
		if (!this.captchaImage) {
			this.refreshCaptcha();
		}
	},
	
	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword;
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
				return;
			}
			
			// 显示加载提示
			uni.showLoading({
				title: '登录中...'
			});
			
			try {
				// 用户端登录接口
				const result = await http.post('/platform/auth/user/login', {
					phonenumber: String(this.phoneNumber || '').trim(),
					password: this.password,
					code: this.verificationCode,
					uuid: this.uuid || uni.getStorageSync('captchaUuid')
				});
				
				console.log('登录响应:', result);
				uni.hideLoading();

				// 后端返回格式：{code: 200, msg: "操作成功", token: "..."}
				if (result.code === 200) {
					// 保存token和用户信息
					if (result.token) {
						uni.setStorageSync('token', result.token);
					}
					// 设置默认身份为学生（用户端登录注册默认都是学生身份）
					uni.setStorageSync('userType', 'student');
					uni.setStorageSync('identity', '学生');
					uni.setStorageSync('identityKey', 'student');
					
					// 如果返回了用户信息，保存用户信息
					if (result.user) {
						uni.setStorageSync('userInfo', result.user);
					}
					
					// 保存用户ID（从多个可能的字段中获取）
					let userId = result.userBaseId || result.userId || result.id || result.user?.userBaseId || result.user?.userId || result.user?.id;
					
					// 如果直接字段中没有用户ID，尝试从JWT token中解析
					if (!userId && result.token) {
						try {
							// JWT token格式：header.payload.signature
							const tokenParts = result.token.split('.');
							if (tokenParts.length === 3) {
								// 解码payload部分（Base64）
								const payloadBase64 = tokenParts[1];
								const payloadString = atob(payloadBase64);
								
								// 使用大整数安全的JSON解析
								// 将超过15位的整数转换为字符串
								const processedPayload = payloadString.replace(
									/"(user_base_id|userBaseId|userId|sub)"\s*:\s*(\d{15,})/g,
									(match, key, number) => {
										return `"${key}":"${number}"`;
									}
								);
								
								const payload = JSON.parse(processedPayload);
								
								// 从JWT中获取用户ID（已经是字符串格式）
								userId = payload.user_base_id || payload.userBaseId || payload.userId || payload.sub;
								
								if (userId) {
									// 确保是字符串
									userId = String(userId);
								}
							}
						} catch (error) {
							console.error('解析JWT token失败:', error);
						}
					}
					
					if (userId) {
						uni.setStorageSync('userId', userId);
					}
					
					this.showMessage(result.msg || '登录成功！', 'success');
					
					// 跳转到目标页面或首页
					// 注意：使用 reLaunch 因为项目使用自定义 tabBar，而不是原生 tabBar
					setTimeout(() => {
						const targetPage = uni.getStorageSync('targetPage');
						if (targetPage) {
							uni.removeStorageSync('targetPage');
							// 使用 reLaunch 跳转（关闭所有页面，打开指定页面）
							uni.reLaunch({
								url: targetPage,
								success: () => {
									console.log('跳转成功:', targetPage);
								},
								fail: (err) => {
									console.error('跳转失败:', err);
									// 如果跳转失败，跳转到首页
									uni.reLaunch({
										url: '/pages/index/index'
									});
								}
							});
						} else {
							// 默认跳转到首页
							uni.reLaunch({
								url: '/pages/index/index',
								success: () => {
									console.log('跳转到首页成功');
								},
								fail: (err) => {
									console.error('跳转到首页失败:', err);
								}
							});
						}
					}, 1000);
				} else {
					this.showMessage(result.msg || '登录失败', 'error');
					this.refreshCaptcha();
				}
			} catch (error) {
				uni.hideLoading();
				console.error('登录错误:', error);
				// 如果错误对象有msg属性，显示后端返回的错误信息
				if (error.msg) {
					this.showMessage(error.msg, 'error');
				} else {
					this.showMessage('网络错误，请稍后重试', 'error');
				}
				this.refreshCaptcha();
			}
		},
		
		// 处理注册
		handleRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
			});
		},
		
		// 短信验证码登录
		handleSmsLogin() {
			uni.showToast({
				title: '短信登录功能开发中',
				icon: 'none'
			});
			// 这里可以跳转到短信登录页面
		},
		
		// 忘记密码
		handleForgotPassword() {
			uni.showToast({
				title: '找回密码功能开发中',
				icon: 'none'
			});
			// 这里可以跳转到找回密码页面
		},
		
		// 刷新验证码
		async refreshCaptcha() {
			// 首先使用静态验证码确保页面有验证码显示
			this.setStaticCaptcha();
			
			// 然后尝试从服务器获取验证码
			try {
				console.log('尝试获取服务器验证码');
				const result = await http.get('/captchaImage');
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
			if (!this.phoneNumber) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return false;
			}
			
			if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return false;
			}
			
			if (this.password.length < 6) {
				uni.showToast({
					title: '密码至少6位',
					icon: 'none'
				});
				return false;
			}
			
			// 验证验证码
			if (!this.verificationCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				});
				return false;
			}
			
			return true;
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

/* 密码输入容器 */
.password-container {
    position: relative;
    width: 100%;
}

.password-input {
    padding-right: 50px;
}

.password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-icon {
    font-size: 18px;
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
    cursor: pointer;
}

.captcha-image:active {
    opacity: 0.8;
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

.login-btn:active {
    opacity: 0.8;
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

.register-btn:active {
    opacity: 0.8;
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
    cursor: pointer;
}

.helper-link:active {
    opacity: 0.7;
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
    
    .input-field {
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


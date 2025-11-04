package com.cesium.auth.service;

import com.cesium.auth.dto.*;
import com.cesium.auth.model.User;
import com.cesium.auth.repository.UserRepository;
import com.cesium.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 认证服务类
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    
    /**
     * 用户注册
     */
    public ApiResponse<Map<String, Object>> register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error("用户名已存在");
        }
        
        // 检查邮箱是否已存在（如果提供了邮箱）
        if (request.getEmail() != null && !request.getEmail().isEmpty() 
            && userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("邮箱已存在");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("user");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // 生成JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername());
        
        // 构建响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", buildUserResponse(savedUser));
        
        return ApiResponse.success("注册成功", responseData);
    }
    
    /**
     * 用户登录
     */
    public ApiResponse<Map<String, Object>> login(LoginRequest request) {
        // 查找用户
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (!userOpt.isPresent()) {
            return ApiResponse.error("用户名或密码错误");
        }
        
        User user = userOpt.get();
        
        // 检查用户是否激活
        if (!user.getIsActive()) {
            return ApiResponse.error("账户已被禁用");
        }
        
        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.error("用户名或密码错误");
        }
        
        // 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // 生成JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        // 构建响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", buildUserResponse(user));
        
        return ApiResponse.success("登录成功", responseData);
    }
    
    /**
     * 获取当前用户信息
     */
    public ApiResponse<Map<String, Object>> getCurrentUser(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ApiResponse.error("用户不存在");
        }
        
        Map<String, Object> userData = buildUserResponse(userOpt.get());
        return ApiResponse.success("获取用户信息成功", userData);
    }
    
    /**
     * 更新用户信息
     */
    public ApiResponse<Map<String, Object>> updateProfile(String username, UpdateProfileRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ApiResponse.error("用户不存在");
        }
        
        User user = userOpt.get();
        
        // 检查邮箱是否已被其他用户使用
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                return ApiResponse.error("邮箱已被其他用户使用");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        Map<String, Object> userData = buildUserResponse(savedUser);
        return ApiResponse.success("更新用户信息成功", userData);
    }
    
    /**
     * 修改密码
     */
    public ApiResponse<String> changePassword(String username, ChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ApiResponse.error("用户不存在");
        }
        
        User user = userOpt.get();
        
        // 验证当前密码
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ApiResponse.error("当前密码错误");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return ApiResponse.success("密码修改成功");
    }
    
    /**
     * 构建用户响应数据
     */
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("_id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("avatar", user.getAvatar());
        userData.put("role", user.getRole());
        userData.put("isActive", user.getIsActive());
        userData.put("lastLogin", user.getLastLogin());
        userData.put("createdAt", user.getCreatedAt());
        userData.put("updatedAt", user.getUpdatedAt());
        return userData;
    }
}

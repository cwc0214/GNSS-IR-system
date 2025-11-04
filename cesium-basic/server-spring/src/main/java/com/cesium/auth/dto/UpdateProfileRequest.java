package com.cesium.auth.dto;

import lombok.Data;
import javax.validation.constraints.Email;

/**
 * 更新用户信息请求DTO
 */
@Data
public class UpdateProfileRequest {
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    private String avatar;
}

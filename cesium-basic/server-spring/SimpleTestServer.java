import java.io.*;
import java.net.*;
import java.util.*;

public class SimpleTestServer {
    private static final int PORT = 8081;
    private static final String AUTH_TOKEN = "test-token-12345";
    
    public static void main(String[] args) {
        System.out.println("启动Cesium认证测试服务器...");
        System.out.println("端口: " + PORT);
        
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("服务器已启动，等待连接...");
            
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("收到连接: " + clientSocket.getInetAddress());
                
                // 在新线程中处理请求
                new Thread(() -> handleRequest(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("服务器启动失败: " + e.getMessage());
        }
    }
    
    private static void handleRequest(Socket clientSocket) {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
             PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
            
            String requestLine = in.readLine();
            if (requestLine == null) return;
            
            System.out.println("请求: " + requestLine);
            
            // 解析请求
            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String path = parts[1];
            
            // 读取所有请求头
            Map<String, String> headers = new HashMap<>();
            String line;
            while ((line = in.readLine()) != null && !line.isEmpty()) {
                String[] header = line.split(": ", 2);
                if (header.length == 2) {
                    headers.put(header[0].toLowerCase(), header[1]);
                }
            }
            
            // 处理不同的端点
            if (path.equals("/api/auth/login")) {
                handleLogin(in, out, method);
            } else if (path.equals("/api/auth/validate")) {
                handleValidate(out, method, headers);
            } else if (path.equals("/api/auth/logout")) {
                handleLogout(out, method, headers);
            } else {
                handleNotFound(out);
            }
            
        } catch (IOException e) {
            System.err.println("处理请求时出错: " + e.getMessage());
        } finally {
            try {
                clientSocket.close();
            } catch (IOException e) {
                System.err.println("关闭连接时出错: " + e.getMessage());
            }
        }
    }
    
    private static void handleLogin(BufferedReader in, PrintWriter out, String method) throws IOException {
        if (!method.equals("POST")) {
            sendResponse(out, 405, "Method Not Allowed", "{\"error\":\"只支持POST方法\"}");
            return;
        }
        
        // 读取请求体
        StringBuilder body = new StringBuilder();
        while (in.ready()) {
            body.append((char) in.read());
        }
        
        System.out.println("登录请求体: " + body.toString());
        
        // 简单的登录验证
        if (body.toString().contains("admin") && body.toString().contains("password")) {
            String response = "{\"success\":true,\"token\":\"" + AUTH_TOKEN + "\",\"message\":\"登录成功\"}";
            sendResponse(out, 200, "OK", response);
            System.out.println("登录成功");
        } else {
            String response = "{\"success\":false,\"message\":\"用户名或密码错误\"}";
            sendResponse(out, 401, "Unauthorized", response);
            System.out.println("登录失败");
        }
    }
    
    private static void handleValidate(PrintWriter out, String method, Map<String, String> headers) {
        if (!method.equals("GET")) {
            sendResponse(out, 405, "Method Not Allowed", "{\"error\":\"只支持GET方法\"}");
            return;
        }
        
        String authHeader = headers.get("authorization");
        if (authHeader != null && authHeader.contains(AUTH_TOKEN)) {
            String response = "{\"valid\":true,\"message\":\"Token有效\"}";
            sendResponse(out, 200, "OK", response);
            System.out.println("Token验证成功");
        } else {
            String response = "{\"valid\":false,\"message\":\"Token无效\"}";
            sendResponse(out, 401, "Unauthorized", response);
            System.out.println("Token验证失败");
        }
    }
    
    private static void handleLogout(PrintWriter out, String method, Map<String, String> headers) {
        if (!method.equals("POST")) {
            sendResponse(out, 405, "Method Not Allowed", "{\"error\":\"只支持POST方法\"}");
            return;
        }
        
        String response = "{\"success\":true,\"message\":\"登出成功\"}";
        sendResponse(out, 200, "OK", response);
        System.out.println("登出成功");
    }
    
    private static void handleNotFound(PrintWriter out) {
        String response = "{\"error\":\"Not Found\",\"message\":\"端点不存在\"}";
        sendResponse(out, 404, "Not Found", response);
    }
    
    private static void sendResponse(PrintWriter out, int statusCode, String statusText, String body) {
        out.println("HTTP/1.1 " + statusCode + " " + statusText);
        out.println("Content-Type: application/json; charset=UTF-8");
        out.println("Access-Control-Allow-Origin: *");
        out.println("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        out.println("Access-Control-Allow-Headers: Content-Type, Authorization");
        out.println("Content-Length: " + body.getBytes().length);
        out.println();
        out.println(body);
        out.flush();
    }
}

// lib/auth.ts
export const getValidToken = () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) return null;
  
      // Remove quotes if present
      token = token.replace(/^"(.*)"$/, '$1');
      
      // Basic JWT format validation
      if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/.test(token)) {
        localStorage.removeItem('token');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Token handling error:', error);
      return null;
    }
  };
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return getValidToken() !== null;
  };
  
  // Store token in localStorage
  export const setToken = (token: string) => {
    localStorage.setItem('token', token);
  };
  
  // Remove token from localStorage
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
  
  // Get user info from token
  export const getUserFromToken = () => {
    const token = getValidToken();
    if (!token) return null;
    
    try {
      // Get the payload part of the JWT (the second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Decode the base64 string
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldQuestion, Bot, TrendingUp, Users } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/admin" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Hero Section */}
        <div className="text-white space-y-4 sm:space-y-6 lg:pr-8 text-center lg:text-left">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Centre of Entrepreneurship
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-4 sm:mb-6">
              AI-Powered Content Management Platform
            </p>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Access our advanced admin dashboard to create and manage AI-generated blog content, 
              oversee staff information, and engage with our entrepreneurship community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
              <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-accent mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold mb-1 text-sm sm:text-base">AI Content Generation</h3>
              <p className="text-xs sm:text-sm text-blue-200">Create comprehensive blog posts from headlines and images</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
              <Users className="h-6 sm:h-8 w-6 sm:w-8 text-accent mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Staff Management</h3>
              <p className="text-xs sm:text-sm text-blue-200">Manage team profiles and showcase expertise</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
              <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-accent mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Analytics Dashboard</h3>
              <p className="text-xs sm:text-sm text-blue-200">Track content performance and engagement</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
              <ShieldQuestion className="h-6 sm:h-8 w-6 sm:w-8 text-accent mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Secure Access</h3>
              <p className="text-xs sm:text-sm text-blue-200">Protected admin area with role-based permissions</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Admin Access
              </CardTitle>
              <p className="text-gray-600">Sign in to manage content and platform settings</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-blue-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    {registerData.password !== registerData.confirmPassword && registerData.confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-orange-600"
                      disabled={registerMutation.isPending || registerData.password !== registerData.confirmPassword}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface ZoneRequest {
  region: string
  type: string
  subtype: string
  description: string
  latitude: number
  longitude: number
  size: string
  address: string
  user: string
  image?: string
}

export interface ZoneResponse {
  id: number
  region: string
  type: string
  subtype: string
  description: string
  latitude: number
  longitude: number
  size: string
  date: string
  address: string
  user: string
  image?: string
}

export interface UserResponse {
  id: number
  email: string
  nickname: string
  profileImage?: string
  createdAt: string
}

export interface UserRequest {
  email: string
  oauthId?: string
  oauthProvider?: "kakao" | "google" | "naver"
  nickname: string
  profileImage?: string
  createdAt?: string
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Zone API methods
  async createZone(zoneData: ZoneRequest): Promise<ZoneResponse> {
    return this.request<ZoneResponse>("/zones", {
      method: "POST",
      body: JSON.stringify(zoneData),
    })
  }

  async getAllZones(): Promise<ZoneResponse[]> {
    return this.request<ZoneResponse[]>("/zones")
  }

  async getZone(id: number): Promise<ZoneResponse> {
    return this.request<ZoneResponse>(`/zones/${id}`)
  }

  async updateZone(id: number, zoneData: ZoneRequest): Promise<ZoneResponse> {
    return this.request<ZoneResponse>(`/zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(zoneData),
    })
  }

  async deleteZone(id: number): Promise<void> {
    return this.request<void>(`/zones/${id}`, {
      method: "DELETE",
    })
  }

  // User API methods
  async createUser(userData: UserRequest): Promise<UserResponse> {
    return this.request<UserResponse>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getUser(id: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`)
  }

  async updateUser(id: number, userData: UserRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()

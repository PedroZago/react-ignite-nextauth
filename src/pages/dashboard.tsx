import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

const Dashboard = () => {
  const { user } = useAuth()

  useEffect(() => {
    api.get<User>('/me')
      .then((response) => { })
      .catch((error) => { })
  }, [])

  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export default Dashboard

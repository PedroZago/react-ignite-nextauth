import { Button } from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { useEffect } from "react"

import { Can } from "../components/Can"

import { useAuth } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

const Dashboard = () => {
  const { user, signOut } = useAuth()

  useEffect(() => {
    api.get<User>('/me')
      .then((response) => { })
      .catch((error) => { })
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <Button
        type="submit"
        mt="6"
        colorScheme="pink"
        onClick={signOut}
      >
        Sign Out
      </Button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export default Dashboard

export const getServerSideProps: GetServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get<User>('/me')

  return {
    props: {}
  }
});
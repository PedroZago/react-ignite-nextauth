import { GetServerSideProps } from "next"

import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

const Metrics = () => {
  return (
    <>
      <h1>Métricas</h1>
    </>
  )
}

export default Metrics

export const getServerSideProps: GetServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  return {
    props: {}
  }
}, {
  permissions: ['metrics.create'],
  roles: ['administrator']
});
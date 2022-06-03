import { Flex, Button, Stack } from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { FormEvent, useState } from 'react'

import { Input } from '../components/Form/Input'

import { useAuth } from '../contexts/AuthContext'
import { withSSRGuest } from '../utils/withSSRGuest'

const Home = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useAuth()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <Flex
      w="100vw"
      h="100vh"
      align="center"
      justify="center"
    >
      <Flex
        as="form"
        width="100%"
        maxWidth={360}
        bg="gray.800"
        p="8"
        borderRadius={8}
        flexDir="column"
        onSubmit={handleSubmit}
      >
        <Stack spacing="4">
          <Input
            type="email"
            label="Email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Input
            type="password"
            label="Senha"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </Stack>

        <Button
          type="submit"
          mt="6"
          colorScheme="pink"
        >
          Entrar
        </Button>
      </Flex>
    </Flex>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {}
  }
});
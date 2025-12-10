import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { Chat } from '@/components/chat'
import { Counter } from '@/components/counter'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <Chat />
      <ClientOnly>
        <Counter />
      </ClientOnly>
    </>
  )
}

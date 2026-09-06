'use client'

import { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function MessagesContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const initAttemptedRef = useRef(false)

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setSelectedConversation(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [])

  const createInitialConversation = useCallback(async (sellerId: string, productId?: string | null) => {
    if (!session) return
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: sellerId,
          content: 'Zainteresovan sam za vaš proizvod. Možete li da mi date više informacija?',
          productIds: productId ? [productId] : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await fetchConversations()
        if (data.conversationId) {
          await fetchMessages(data.conversationId)
        }
      } else {
        console.error('Error creating conversation:', await response.text())
      }
    } catch (error) {
      console.error('Error creating initial conversation:', error)
    }
  }, [session, fetchConversations, fetchMessages])

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchConversations()
  }, [session, router, fetchConversations])

  // Reset flag kada se URL promeni
  useEffect(() => {
    initAttemptedRef.current = false
  }, [searchParams.get('sellerId')])

  // Odvojen effect za inicijalizaciju URL parametara - pokreće se samo kada loading promeni
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loading) {
      return // Čekaj da se konverzacije učitaju
    }

    // Ako nema podataka o konverzacijama, čekaj
    if (!conversations || conversations.length === undefined) {
      return
    }

    const sellerId = searchParams.get('sellerId')
    
    // Ako nema sellerId, zaustavi se
    if (!sellerId) {
      return
    }

    // Ako je već pokušano inicijalizovati, zaustavi se
    if (initAttemptedRef.current) {
      return
    }

    // Ako je već učitana konverzacija, zaustavi se
    if (selectedConversation) {
      return
    }

    initAttemptedRef.current = true

    const initializeFromUrl = async () => {
      try {
        const productId = searchParams.get('productId')
        
        // Pronađi konverzaciju sa prodavcem
        const conversation = conversations.find(conv => {
          const otherParticipant = conv.participantAId === (session?.user as any)?.id 
            ? conv.participantBId 
            : conv.participantAId
          return otherParticipant === sellerId
        })
        
        if (conversation) {
          // Ako konverzacija postoji, učitaj je
          await fetchMessages(conversation.id || conversation._id)
        } else {
          // Ako ne postoji, kreiraj novu
          await createInitialConversation(sellerId, productId)
        }
      } catch (error) {
        console.error('Error initializing conversation:', error)
      }
    }

    initializeFromUrl()
  }, [loading]) // SAMO loading kao dependency!

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation.otherParticipant.id,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedConversation.conversation.id || selectedConversation.conversation._id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Poruke</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Početna
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
          <div className="grid grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="col-span-1 border-r overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold">Konverzacije</h2>
              </div>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  Nemate poruka
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id || conv._id}
                      onClick={() => fetchMessages(conv.id || conv._id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 ${
                        (selectedConversation?.conversation.id || selectedConversation?.conversation._id) === (conv.id || conv._id) ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium">Konverzacija</div>
                      {conv.lastMessage && (
                        <div className="text-sm text-gray-600 truncate">
                          {conv.lastMessage.content}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="col-span-2 flex flex-col">
              {initializing && !selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                    <p>Inicijalizujem konverzaciju...</p>
                  </div>
                </div>
              ) : selectedConversation ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold">
                      {selectedConversation.otherParticipant.name}
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg: any, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.senderId === (session?.user as any)?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === (session?.user as any)?.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napišite poruku..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                      >
                        Pošalji
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                  Izaberite konverzaciju
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Učitavanje...</div>}>
      <MessagesContent key="messages-content" />
    </Suspense>
  )
}

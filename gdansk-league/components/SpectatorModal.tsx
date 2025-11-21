'use client'

import { useState } from 'react'

interface SpectatorModalProps {
  isOpen: boolean
  onClose: () => void
  summonerName: string
  puuid: string
}

export default function SpectatorModal({ isOpen, onClose, summonerName, puuid }: SpectatorModalProps) {
  const [spectatorCommand, setSpectatorCommand] = useState<string>('')
  const [batFileContent, setBatFileContent] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch spectator command when modal opens
  useState(() => {
    if (isOpen && !spectatorCommand) {
      fetchSpectatorCommand()
    }
  })

  async function fetchSpectatorCommand() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/spectate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puuid, summonerName })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate spectator command')
        return
      }

      setSpectatorCommand(data.spectatorCommand)
      setBatFileContent(data.batFileContent)
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Spectator command error:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(spectatorCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadBatFile() {
    const blob = new Blob([batFileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `watch_${summonerName}.bat`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0f1420] rounded-lg border border-[#1e2836] max-w-2xl w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Watch {summonerName}'s live game</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-sm">Generating spectator command...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        {!loading && !error && spectatorCommand && (
          <>
            {/* Method 1: Copy Command */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-2">Method 1: Copy command (recommended)</h3>
              <div className="bg-[#151b28] rounded-lg p-3 mb-3 border border-[#2a3142]">
                <code className="text-xs text-gray-300 break-all">{spectatorCommand}</code>
              </div>
              <button
                onClick={copyToClipboard}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy to clipboard'}
              </button>

              {/* Instructions */}
              <div className="mt-3 bg-[#151b28] rounded-lg p-3 border border-[#2a3142]">
                <div className="text-xs text-gray-400 mb-2">How to use:</div>
                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                  <li>Click "Copy to clipboard" above</li>
                  <li>Press <kbd className="bg-[#0f1420] px-1.5 py-0.5 rounded border border-[#2a3142]">Win + R</kbd> on your keyboard</li>
                  <li>Paste the command (Ctrl + V) and press Enter</li>
                  <li>League of Legends will open in spectator mode (3-min delay)</li>
                </ol>
              </div>
            </div>

            {/* Method 2: Download BAT */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Method 2: Download launcher</h3>
              <button
                onClick={downloadBatFile}
                className="w-full bg-[#151b28] hover:bg-[#1a2030] border border-[#2a3142] text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Download watch_{summonerName}.bat
              </button>
              <div className="mt-2 text-xs text-gray-400">
                Double-click the downloaded file to launch League in spectator mode
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

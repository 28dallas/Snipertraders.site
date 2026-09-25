'use client'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Lock, Trash2, Link2, Save } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { readClientState, writeClientState } from '@/lib/client-persistence'
import { persistProfilePreferences } from '@/lib/persistence'

const DEFAULT_PROFILE = { full_name: 'James Mwangi', email: 'james@example.com', phone: '0712345678' }
const DEFAULT_NOTIFICATIONS = { email_trades: true, email_weekly: true, push_trades: false }

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    full_name: 'James Mwangi',
    email: 'james@example.com',
    phone: '0712345678',
  })
  const [notifications, setNotifications] = useState({
    email_trades: true,
    email_weekly: true,
    push_trades: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(readClientState('ranger-profile', DEFAULT_PROFILE))
    setNotifications(readClientState('ranger-notifications', DEFAULT_NOTIFICATIONS))
  }, [])

  const handleSave = () => {
    writeClientState('ranger-profile', profile)
    writeClientState('ranger-notifications', notifications)
    void persistProfilePreferences(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            JM
          </div>
          <div>
            <Button variant="outline" size="sm">Upload Photo</Button>
            <p className="text-muted-foreground text-xs mt-1.5">JPG, PNG up to 2MB</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'full_name', label: 'Full Name', icon: User, type: 'text' },
            { key: 'email', label: 'Email Address', icon: Mail, type: 'email' },
            { key: 'phone', label: 'Phone (M-Pesa)', icon: Phone, type: 'tel' },
          ].map(({ key, label, icon: Icon, type }) => (
            <div key={key}>
              <label className="text-white text-sm font-medium mb-1.5 block">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={type}
                  value={profile[key as keyof typeof profile]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <Button variant="primary" className="mt-5" onClick={handleSave}>
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Connected Accounts
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Deriv Account', id: 'CR1234567', connected: true, color: 'text-primary' },
            { name: 'Google', id: 'james@gmail.com', connected: true, color: 'text-blue-400' },
            { name: 'Telegram', id: 'Not connected', connected: false, color: 'text-muted-foreground' },
          ].map(({ name, id, connected, color }) => (
            <div key={name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-white text-sm font-medium">{name}</div>
                <div className={`text-xs mt-0.5 ${color}`}>{id}</div>
              </div>
              {connected
                ? <Badge variant="green">Connected</Badge>
                : <Button variant="outline" size="sm">Connect</Button>
              }
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Change Password
        </h2>
        <div className="space-y-4">
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label}>
              <label className="text-white text-sm font-medium mb-1.5 block">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
          <Button variant="outline">Update Password</Button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'email_trades', label: 'Email on every trade', sub: 'Receive an email for each trade executed' },
            { key: 'email_weekly', label: 'Weekly performance summary', sub: 'Get a weekly P&L report via email' },
            { key: 'push_trades', label: 'Push notifications', sub: 'Browser push notifications for trades' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-white text-sm font-medium">{label}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{sub}</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                className={`relative w-11 h-6 rounded-full transition-all ${notifications[key as keyof typeof notifications] ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[key as keyof typeof notifications] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/30">
        <h2 className="text-danger font-bold text-lg mb-3 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="ghost" className="text-danger border border-danger/30 hover:bg-danger/10">
          Delete Account
        </Button>
      </Card>
    </div>
  )
}

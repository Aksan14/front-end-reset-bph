'use client'
import { endpoints } from '@/config/api'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material'
import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode"

// helper ambil cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function PasswordDialog({ open, setOpen }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nra, setNra] = useState(null)

  // ambil nra dari cookie saat komponen mount
  useEffect(() => {
    // jika nra disimpan langsung di cookie
    let cookieNra = getCookie("nra")
    if (cookieNra) {
      setNra(cookieNra)
      return
    }

    // jika hanya ada authToken (JWT)
    const token = getCookie("authToken")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.nra) {
          setNra(decoded.nra)
        }
      } catch (err) {
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlert({ severity: 'error', message: 'Semua field harus diisi!' })
      return
    }
    if (newPassword !== confirmPassword) {
      setAlert({ severity: 'error', message: 'Konfirmasi password tidak cocok!' })
      return
    }
    if (!nra) {
      setAlert({ severity: 'error', message: 'NRA tidak ditemukan, silakan login ulang.' })
      return
    }

    setLoading(true)
    setAlert(null)

    try {
      const res = await fetch(endpoints.ADMIN_UPDATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nra,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        data = { message: 'Response server tidak valid' }
      }

      if (res.ok) {
        setAlert({ severity: 'success', message: data.message || 'Password berhasil diubah!' })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setOpen(false), 1500)
      } else {
        setAlert({ severity: 'error', message: data.message || 'Gagal mengubah password!' })
      }
    } catch (err) {
      setAlert({ severity: 'error', message: 'Terjadi kesalahan server!' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Ganti Password</DialogTitle>
      <DialogContent>
        {alert && (
          <Alert severity={alert.severity} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Password Lama"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Konfirmasi Password Baru"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Simpan'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { redirect } from 'next/navigation'

export const metadata = {
  title: 'UI Kelola Inventaris',
  description: 'Aplikasi Manajemen Inventaris dan Peminjaman Barang',
}

export default function Home() {
  // Di Next.js, kita perlu menggunakan 'use client' untuk mengakses localStorage
  // Karena ini adalah Server Component, kita akan redirect ke halaman yang sesuai
  redirect('/dashboard')
}
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'UI Kelola Inventaris',
  description: 'Aplikasi Manajemen Inventaris dan Peminjaman Barang',
}

export default function Home() {
  redirect('/dashboard')
}
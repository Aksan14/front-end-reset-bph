import DashboardIcon from '@mui/icons-material/Dashboard'
import PaymentsIcon from '@mui/icons-material/Payments'
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'
import ReportProblemIcon from '@mui/icons-material/ReportProblem' 

export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Barang', icon: <PaymentsIcon />, path: '/barang' },
  { text: 'Halaman Peminjaman', icon: <AssignmentReturnIcon />, path: '/halaman-peminjaman' },
  { text: 'Cek Bulanan', icon: <ReportProblemIcon />, path: '/cek-bulanan' },
  // { text: 'Report', icon: <ReportProblemIcon />, path: '/report' },
]
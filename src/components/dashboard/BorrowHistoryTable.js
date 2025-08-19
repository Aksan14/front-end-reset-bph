// src/components/dashboard/BorrowHistoryTable.js
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  CircularProgress,
  Avatar,
  Chip,
  Box,
  Skeleton
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status?.toLowerCase()) {
      case 'dipinjam': return 'warning';
      case 'dikembalikan': return 'success';
      case 'rusak': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={status || "-"}
      color={getColor()}
      size="small"
      sx={{ 
        fontWeight: 500,
        minWidth: 100,
        borderRadius: 1
      }}
    />
  );
};

// Add StatusIcon component
const StatusIcon = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'selesai':
    case 'dikembalikan':
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />;
    case 'dipinjam':
      return <PendingIcon sx={{ color: 'warning.main', fontSize: '1.25rem' }} />;
    default:
      return <ScheduleIcon sx={{ color: 'info.main', fontSize: '1.25rem' }} />;
  }
};

export default function BorrowHistoryTable({ borrows = [], loading }) {
  return (
    <TableContainer sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ 
            backgroundColor: '#f8fafc',
            '& th': { 
              fontWeight: 600,
              color: '#64748b'
            }
          }}>
            {/* Kolom yang selalu tampil */}
            <TableCell>Peminjam</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Barang</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Tanggal Pinjam</TableCell>
            <TableCell>Rencana Kembali</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell><Skeleton variant="text" width={120} height={40} /></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" width={100} height={40} /></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton variant="text" width={90} height={40} /></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={40} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={80} height={40} /></TableCell>
              </TableRow>
            ))
          ) : borrows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  Tidak ada data peminjaman
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            borrows.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: '#e0e7ff',
                        color: '#6366f1',
                        fontWeight: 500
                      }}>
                        {row.namaPeminjam?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {row.namaPeminjam || "-"}
                      </Typography>
                    </Box>
                    {/* Info tambahan untuk mobile */}
                    <Box sx={{ 
                      display: { xs: 'block', md: 'none' },
                      ml: 5.5,
                      mt: -0.5
                    }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {row.namaBarang || "-"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {row.namaBarang || "-"}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {formatDate(row.tanggalPinjam)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(row.rencanaKembali)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 1 
                  }}>
                    {/* Icon for mobile */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                      <StatusIcon status={row.status} />
                    </Box>
                    {/* Chip for larger screens */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <StatusChip status={row.status} />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
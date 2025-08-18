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
            <TableCell>Peminjam</TableCell>
            <TableCell>Barang</TableCell>
            <TableCell>Tanggal Pinjam</TableCell>
            <TableCell>Rencana Kembali</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell><Skeleton variant="text" width={120} height={40} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} height={40} /></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={40} /></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={40} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={80} height={40} /></TableCell>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: '#e0e7ff',
                      color: '#6366f1',
                      fontWeight: 500
                    }}>
                      {row.namaPeminjam?.charAt(0) || '?'}
                    </Avatar>
                    <Typography>{row.namaPeminjam || "-"}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.namaBarang || "-"}</TableCell>
                <TableCell>{formatDate(row.tanggalPinjam)}</TableCell>
                <TableCell>{formatDate(row.rencanaKembali)}</TableCell>
                <TableCell align="center">
                  <StatusChip status={row.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
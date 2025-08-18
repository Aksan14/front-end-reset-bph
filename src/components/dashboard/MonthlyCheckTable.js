import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress } from '@mui/material'

export default function MonthlyCheckTable({ checks = [], loading }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Pengecekan Bulanan Terakhir
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tanggal</TableCell>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Kondisi</TableCell>
            <TableCell>Jumlah Aktual</TableCell>
            <TableCell>Catatan</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : checks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Tidak ada data pengecekan.
              </TableCell>
            </TableRow>
          ) : (
            checks.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.tanggal || '-'}</TableCell>
                <TableCell>{row.namaBarang || '-'}</TableCell>
                <TableCell>{row.kondisi || '-'}</TableCell>
                <TableCell>{row.jumlahAktual || '-'}</TableCell>
                <TableCell>{row.catatan || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
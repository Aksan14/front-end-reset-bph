<TableContainer sx={{ 
  overflowX: "auto",
  "& .MuiTable-root": {
    minWidth: { xs: '100%', sm: 600 }, // Reduced from 800
    "& th": {
      px: { xs: 1, sm: 2 },
      py: { xs: 1.5, sm: 2 },
      fontSize: { xs: "0.813rem", sm: "0.875rem" },
      whiteSpace: "nowrap"
    },
    "& td": {
      px: { xs: 1, sm: 2 },
      py: { xs: 1.5, sm: 2 },
      fontSize: { xs: "0.813rem", sm: "0.875rem" }
    }
  }
}}>
  <Table>
    {/* Table content */}
  </Table>
</TableContainer>
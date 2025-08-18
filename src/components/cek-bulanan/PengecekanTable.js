import { useState } from "react";
import { Table, Form } from "react-bootstrap";

export default function PengecekanTable({ data, onChange }) {
  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Barang</th>
          <th>Jumlah Sekarang</th>
          <th>Kondisi</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.nama_barang}</td>
              <td>
                <Form.Control
                  type="number"
                  value={item.jumlah_sekarang || ""}
                  onChange={(e) =>
                    handleChange(i, "jumlah_sekarang", e.target.value)
                  }
                />
              </td>
              <td>
                <Form.Select
                  value={item.kondisi || ""}
                  onChange={(e) =>
                    handleChange(i, "kondisi", e.target.value)
                  }
                >
                  <option value="">Pilih</option>
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </Form.Select>
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={item.keterangan || ""}
                  onChange={(e) =>
                    handleChange(i, "keterangan", e.tar .value)
                  }
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">
              Tidak ada data
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

// services/laporanService.ts

import API from "./api";

export const getLaporan = async () => {
  const res = await API.get("/laporan");
  return res.data;
};

export const getDetailLaporan = async (
  id: string
) => {
  const res = await API.get(
    `/laporan/${id}`
  );

  return res.data;
};

export const createLaporan = async (
  data: FormData
) => {
  // JANGAN SET CONTENT-TYPE MANUAL
  const res = await API.post(
    "/laporan",
    data
  );

  return res.data;
};

export const deleteLaporan = async (
  id: string
) => {
  const res = await API.delete(
    `/laporan/${id}`
  );

  return res.data;
};

export const updateLaporan = async (
  id: string,
  data: any
) => {
  const res = await API.put(
    `/laporan/${id}`,
    data
  );

  return res.data;
};
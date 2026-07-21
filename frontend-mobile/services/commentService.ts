import API from "./api";

export const getComments =
  async (
    laporanId: string
  ) => {
    const response =
      await API.get(
        `/comments?laporan_id=${laporanId}`
      );

    return response.data;
  };

export const createComment =
  async (
    laporanId: string,
    komentar: string
  ) => {
    const response =
      await API.post(
        "/comments",
        {
          laporan_id:
            laporanId,
          komentar,
        }
      );

    return response.data;
  };

export const deleteComment =
  async (id: string) => {
    const response =
      await API.delete(
        `/comments/${id}`
      );

    return response.data;
  };
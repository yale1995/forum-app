function status(request, response) {
  return response.status(200).json({ chave: "message here" });
}

export default status;

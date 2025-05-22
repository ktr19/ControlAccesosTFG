import keyboard
import requests

API_URL = "http://localhost:5000/employees/activate"

print("Escanea un QR con delimitadores QR_SCANNER_START ... QR_SCANNER_END (Ctrl+C para salir)...")

buffer = ""
recording = False

try:
    while True:
        event = keyboard.read_event()
        if event.event_type == keyboard.KEY_DOWN:
            char = event.name

            if char == "enter":
                if recording:
                    if "QR_SCANNER_END" in buffer:
                        qr_data = buffer.split("QR_SCANNER_START")[1].split("QR_SCANNER_END")[0].strip()
                        print(f"\n📥 QR capturado: {qr_data}")

                        try:
                            # Parseo simple: CompanyId:1,ID:31,qr_code:abcdef...,token:xxxx
                              # Parseo robusto: split solo en el primer ":"
                            parts = dict(p.split(":", 1) for p in qr_data.split(",") if ":" in p)
                            employee_id = parts.get("ID")
                            qr_code = parts.get("qr_code")
                            auth_token = parts.get("token")


                            if not all([ employee_id, qr_code, auth_token]):
                                raise ValueError("Faltan datos en el QR")

                            headers = {
                                "Authorization": f"Bearer {auth_token}"
                            }

                            response = requests.post(API_URL, json={
                                "employee_id": employee_id,
                                "qr_code": qr_code
                            }, headers=headers)

                            if response.status_code == 200:
                                data = response.json()
                                print(f"✅ {data['message']}: {data['nombre']} (ID: {data['employee_id']})")
                            else:
                                print(f"❌ Error {response.status_code}: {response.json().get('message', 'Respuesta inesperada')}")

                        except Exception as e:
                            print(f"❌ Fallo al procesar el código: {e}")
                        buffer = ""
                        recording = False
                else:
                    buffer = ""  # Reinicia si ENTER llegó fuera del escaneo
            elif char == "space":
                buffer += " "
            elif char in ["shift", "ctrl", "alt", "alt gr"]:
                continue  # Ignora teclas modificadoras
            elif len(char) == 1:
                buffer += char
                if "QR_SCANNER_START" in buffer:
                    recording = True

except KeyboardInterrupt:
    print("\n🛑 Programa terminado.")

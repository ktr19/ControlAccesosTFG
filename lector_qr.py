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
                    # Terminó la captura
                    if "QR_SCANNER_END" in buffer:
                        qr_data = buffer.split("QR_SCANNER_START")[1].split("QR_SCANNER_END")[0].strip()
                        print(f"\n📥 QR capturado: {qr_data}")

                        try:
                            # Parseo simple: CompanyId:1,ID:31,qr_code:abcdef...
                            parts = qr_data.split(",")
                            company_id = parts[0].split(":")[1].strip()
                            employee_id = parts[1].split(":")[1].strip()
                            qr_code = parts[2].split(":")[1].strip()

                            response = requests.post(API_URL, json={
                                "company_id": company_id,
                                "employee_id": employee_id,
                                "qr_code": qr_code
                            })

                            if response.status_code == 200:
                                data = response.json()
                                print(f"✅ {data['message']}: {data['nombre']} (ID: {data['employee_id']})")
                            else:
                                print(f"❌ Error: {response.json().get('message', 'Respuesta inesperada')}")

                        except Exception as e:
                            print(f"❌ Fallo al procesar el código: {e}")
                        buffer = ""
                        recording = False
                else:
                    buffer = ""  # Limpia si enter llega fuera de una secuencia
            elif char == "space":
                buffer += " "
            elif char == "shift":
                continue  # Ignora shift como carácter
            elif len(char) == 1:
                buffer += char
                if "QR_SCANNER_START" in buffer:
                    recording = True

except KeyboardInterrupt:
    print("\n🛑 Programa terminado.")

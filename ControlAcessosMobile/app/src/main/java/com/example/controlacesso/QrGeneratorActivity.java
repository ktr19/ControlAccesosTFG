package com.example.controlacesso;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.zxing.BarcodeFormat;
import com.journeyapps.barcodescanner.BarcodeEncoder;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class QrGeneratorActivity extends AppCompatActivity {

    private static Bitmap cachedQrBitmap = null;
    private static String currentQrCode = null;

    private CountDownTimer qrTimer;
    private static final int QR_REFRESH_INTERVAL = 10_000; // 10 segundos

    private ImageView qrImage;
    private ProgressBar countdownProgress;

    private int employeeId, companyId;
    private String firstName, lastName, email, role;
    private Boolean previousIsActive = null;

    private String authToken;  // Token para autenticación

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_generator);

        qrImage = findViewById(R.id.qr_image);
        countdownProgress = findViewById(R.id.countdown_progress);
        Button goToProfile = findViewById(R.id.go_to_profile);

        // Leer token de SharedPreferences
        SharedPreferences prefs = getSharedPreferences("MyAppPrefs", MODE_PRIVATE);
        authToken = prefs.getString("auth_token", null);

        Intent intent = getIntent();
        employeeId = intent.getIntExtra("employee_id", -1);
        companyId = intent.getIntExtra("company_id", -1);
        firstName = intent.getStringExtra("first_name");
        lastName = intent.getStringExtra("last_name");
        email = intent.getStringExtra("email");
        role = intent.getStringExtra("role");

        if (cachedQrBitmap != null) {
            qrImage.setImageBitmap(cachedQrBitmap);
        }

        // Solo genera y muestra el QR, el timer se iniciará luego
        generateAndShowQR();

        Button logoutButton = findViewById(R.id.logout_button);
        logoutButton.setOnClickListener(v -> {
            // Limpiar sesión
            SharedPreferences.Editor editor = prefs.edit();
            editor.clear();
            editor.apply();

            Toast.makeText(QrGeneratorActivity.this, "Sesión cerrada", Toast.LENGTH_SHORT).show();

            Intent intent3 = new Intent(QrGeneratorActivity.this, MainActivity.class);
            intent3.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent3);
        });

        goToProfile.setOnClickListener(v -> {
            Intent intent2 = new Intent(QrGeneratorActivity.this, UserProfileActivity.class);
            intent2.putExtra("employee_id", employeeId);
            intent2.putExtra("company_id", companyId);
            intent2.putExtra("first_name", firstName);
            intent2.putExtra("last_name", lastName);
            intent2.putExtra("email", email);
            intent2.putExtra("role", role);
            startActivityForResult(intent2, 1);
        });
    }

    private void generateAndShowQR() {
        String url = "http://10.0.2.2:5000/employees/" + employeeId;
        RequestQueue queue = Volley.newRequestQueue(this);

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.GET, url, null,
                response -> {
                    try {
                        boolean currentIsActive = response.getBoolean("is_active");

                        if (previousIsActive != null && currentIsActive != previousIsActive) {
                            String msg = currentIsActive ? "✅ Entrada registrada" : "👋 Salida registrada";
                            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();

                            if (qrTimer != null) {
                                qrTimer.cancel();
                                qrTimer = null;
                            }
                            qrImage.setImageBitmap(null);
                            countdownProgress.setProgress(0);
                        } else {
                            previousIsActive = currentIsActive;
                            generateQrAndUpload(currentIsActive);

                            // Inicia el temporizador SOLO después de que el QR se haya generado
                            startTimer();
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                },
                error -> {
                    Toast.makeText(this, "Error consultando estado de usuario", Toast.LENGTH_SHORT).show();
                    generateQrAndUpload(previousIsActive != null ? previousIsActive : false);

                    // Iniciar temporizador también en caso de error (fallback)
                    startTimer();
                }) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                if (authToken != null) {
                    headers.put("Authorization", "Bearer " + authToken);
                }
                return headers;
            }
        };

        queue.add(request);
    }

    private void startTimer() {
        // Cancelar temporizador activo si existe
        if (qrTimer != null) {
            qrTimer.cancel();
        }

        qrTimer = new CountDownTimer(QR_REFRESH_INTERVAL, 100) {
            public void onTick(long millisUntilFinished) {
                int progress = (int) ((millisUntilFinished * 100) / QR_REFRESH_INTERVAL);
                countdownProgress.setProgress(progress);
            }

            public void onFinish() {
                countdownProgress.setProgress(0);
                generateAndShowQR();
            }
        }.start();
    }

    private void generateQrAndUpload(boolean isActiveNow) {
        String currentTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date());

        String qrContent = "ID:" + employeeId +
                ",Nombre:" + firstName + " " + lastName +
                ",Email:" + email +
                ",Rol:" + role +
                ",Activo:" + (isActiveNow ? "Sí" : "No") +
                ",Hora:" + currentTime;

        try {
            String qr_Code = sha256(qrContent);
            currentQrCode = qr_Code;

            String qr_hash = "QR_SCANNER_START " +
                    ",ID:" + employeeId +
                    ",qr_code:" + qr_Code +
                    ",token:"+authToken+
                    " QR_SCANNER_END";

            BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
            Bitmap bitmap = barcodeEncoder.encodeBitmap(qr_hash, BarcodeFormat.QR_CODE, 400, 400);
            qrImage.setImageBitmap(bitmap);
            cachedQrBitmap = bitmap;

            sendQrToServer(qr_Code, employeeId);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendQrToServer(String qrContent, int employeeId) {
        String url = "http://10.0.2.2:5000/employees/" + employeeId + "/qr";
        JSONObject json = new JSONObject();

        try {
            json.put("qr_code", qrContent);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        RequestQueue queue = Volley.newRequestQueue(this);

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, url, json,
                response -> Log.d("QR_UPLOAD", "QR guardado exitosamente"),
                error -> Log.e("QR_UPLOAD", "Error al guardar el QR: " + error.toString())
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                if (authToken != null) {
                    headers.put("Authorization", "Bearer " + authToken);
                }
                return headers;
            }
        };

        queue.add(request);
    }

    private String sha256(String base) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}

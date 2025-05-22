package com.example.controlacesso;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private EditText usernameEditText;
    private EditText passwordEditText;
    private Button loginButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        usernameEditText = findViewById(R.id.username);
        passwordEditText = findViewById(R.id.password);
        loginButton = findViewById(R.id.login_button);

        loginButton.setOnClickListener(v -> {
            String email = usernameEditText.getText().toString().trim();
            String password = passwordEditText.getText().toString().trim();

            String url = "http://10.0.2.2:5000/login";

            JSONObject json = new JSONObject();
            try {
                json.put("email", email);
                json.put("password", password);
            } catch (JSONException e) {
                e.printStackTrace();
                Toast.makeText(MainActivity.this, "Error creando el JSON", Toast.LENGTH_SHORT).show();
                return;
            }

            RequestQueue queue = Volley.newRequestQueue(getApplicationContext());

            JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, url, json,
                    response -> {
                        Log.d("LOGIN_RESPONSE", response.toString());  // Para depurar la respuesta

                        try {
                            JSONObject employee = response.getJSONObject("employee");

                            int employeeId = employee.getInt("employee_id");
                            int companyId = employee.getInt("company_id");

                            String firstName = employee.getString("first_name");
                            String lastName = employee.getString("last_name");
                            String emailResp = employee.getString("email");
                            String role = employee.getString("role");

                            String token = response.getString("token");

                            // Guardar token y datos en SharedPreferences
                            SharedPreferences prefs = getSharedPreferences("MyAppPrefs", MODE_PRIVATE);
                            SharedPreferences.Editor editor = prefs.edit();
                            editor.putString("auth_token", token);
                            editor.putInt("employee_id", employeeId);
                            editor.putInt("company_id", companyId);
                            editor.putString("first_name", firstName);
                            editor.putString("last_name", lastName);
                            editor.putString("email", emailResp);
                            editor.putString("role", role);
                            editor.apply();

                            Log.d("LOGIN", "Empleado: " + firstName + " " + lastName + " (ID: " + employeeId + ")");

                            // Pasar datos a la siguiente actividad
                            Intent intent = new Intent(MainActivity.this, QrGeneratorActivity.class);
                            intent.putExtra("employee_id", employeeId);
                            intent.putExtra("company_id", companyId);
                            intent.putExtra("first_name", firstName);
                            intent.putExtra("last_name", lastName);
                            intent.putExtra("email", emailResp);
                            intent.putExtra("role", role);

                            startActivity(intent);

                            Toast.makeText(MainActivity.this, "Login exitoso", Toast.LENGTH_SHORT).show();

                        } catch (JSONException e) {
                            e.printStackTrace();
                            Toast.makeText(MainActivity.this, "Error al procesar la respuesta", Toast.LENGTH_SHORT).show();
                        }
                    },
                    error -> {
                        Log.e("LOGIN", "Error en login: " + error.toString());
                        Toast.makeText(MainActivity.this, "Usuario o contraseña incorrectos", Toast.LENGTH_SHORT).show();
                    }
            );

            queue.add(request);
        });
    }
}

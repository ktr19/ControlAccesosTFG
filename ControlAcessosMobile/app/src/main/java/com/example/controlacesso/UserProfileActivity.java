package com.example.controlacesso;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.InputType;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


public class UserProfileActivity extends AppCompatActivity {

    private TextView employeeIdTextView, companyIdTextView, roleTextView;
    private TextView nameTextView, surnameTextView, emailTextView;
    private String authToken;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        SharedPreferences prefs = getSharedPreferences("MyAppPrefs", MODE_PRIVATE);
        authToken = prefs.getString("auth_token", null);
        employeeIdTextView = findViewById(R.id.employee_id);
        companyIdTextView = findViewById(R.id.company_id);
        roleTextView = findViewById(R.id.role);
        nameTextView = findViewById(R.id.name);
        surnameTextView = findViewById(R.id.surname);
        emailTextView = findViewById(R.id.email);

        Button changePasswordButton = findViewById(R.id.change_password_button);
        Button backButton = findViewById(R.id.back_button);

        Intent intent = getIntent();
        String employeeId = String.valueOf(intent.getIntExtra("employee_id", -1));
        String companyId = String.valueOf(intent.getIntExtra("company_id", -1));
        String firstName = intent.getStringExtra("first_name");
        String lastName = intent.getStringExtra("last_name");
        String email = intent.getStringExtra("email");
        String role = intent.getStringExtra("role");

        employeeIdTextView.setText(employeeId);
        companyIdTextView.setText(companyId);
        roleTextView.setText(role);
        nameTextView.setText(firstName);
        surnameTextView.setText(lastName);
        emailTextView.setText(email);

        changePasswordButton.setOnClickListener(v -> showChangePasswordDialog());
        backButton.setOnClickListener(v -> {
            setResult(RESULT_OK);
            finish();
        });
    }

    private void showChangePasswordDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(UserProfileActivity.this);
        builder.setTitle("Change Password");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int marginPx = (int) (getResources().getDisplayMetrics().density * 8);

        final EditText newPasswordView = new EditText(this);
        newPasswordView.setHint("New Password");
        newPasswordView.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        newPasswordView.setBackgroundResource(R.drawable.input_background);
        newPasswordView.setTextColor(getResources().getColor(R.color.white));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(marginPx, marginPx, marginPx, marginPx);
        newPasswordView.setLayoutParams(params);

        final EditText confirmPasswordView = new EditText(this);
        confirmPasswordView.setHint("Confirm Password");
        confirmPasswordView.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        confirmPasswordView.setBackgroundResource(R.drawable.input_background);
        confirmPasswordView.setTextColor(getResources().getColor(R.color.white));
        confirmPasswordView.setLayoutParams(params);

        layout.addView(newPasswordView);
        layout.addView(confirmPasswordView);

        builder.setView(layout);

        builder.setPositiveButton("Change", (dialog, which) -> {
            String newPassword = newPasswordView.getText().toString();
            String confirmPassword = confirmPasswordView.getText().toString();

            if (!newPassword.equals(confirmPassword)) {
                Toast.makeText(UserProfileActivity.this, "Passwords do not match!", Toast.LENGTH_SHORT).show();
                return;
            }
            if (newPassword.length() < 8) {
                Toast.makeText(UserProfileActivity.this, "Password must be at least 8 characters", Toast.LENGTH_SHORT).show();
                return;
            }

            sendChangePasswordRequest(newPassword);
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());

        builder.show();
    }

    private void sendChangePasswordRequest(String newPassword) {
        String employeeId = employeeIdTextView.getText().toString();
        String url = "http://10.0.2.2:5000/employees/" + employeeId + "/change_password";

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("new_password", newPassword);
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error forming JSON", Toast.LENGTH_SHORT).show();
            return;
        }

        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                jsonBody,
                response -> Toast.makeText(this, "Password changed successfully!", Toast.LENGTH_SHORT).show(),
                error -> Toast.makeText(this, "Error changing password", Toast.LENGTH_SHORT).show()
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + authToken);
                headers.put("Content-Type", "application/json");
                return headers;
            }
        };

        RequestQueue queue = Volley.newRequestQueue(this);
        queue.add(request);
    }
}
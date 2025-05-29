'use client';

import React from 'react';
import { useState, useRef, useMemo } from 'react'; // Import useRef dan useEffect
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

import {
  Tabs,
  Button,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@skripsi/components';
import { cn } from '@skripsi/libs';
import { editor } from 'monaco-editor';
import type { Monaco } from '@monaco-editor/react';
import ThreeSceneWrapper from './3d-box';
import { FaCode } from 'react-icons/fa';
import { TbHexagon3D } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MonacoEditor: React.FC<{ code: string }> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const editorOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: true,
      cursorStyle: 'line' as const,
      automaticLayout: true,
      theme: 'hc-black',
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on' as const,
      accessibilitySupport: 'auto' as const,
      accessibilityPageSize: 10,
      ariaLabel: 'Editor content' as const,
      ariaRequired: false,
      screenReaderAnnounceInlineSuggestion: true,
      autoClosingBrackets: 'languageDefined' as const,
      autoClosingComments: 'languageDefined' as const,
      autoClosingDelete: 'auto' as const,
      autoClosingOvertype: 'auto' as const,
      autoClosingQuotes: 'languageDefined' as const,
      autoIndent: 'full' as const,
      autoSurround: 'languageDefined' as const,
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: false,
      },
      bracketPairGuides: {
        bracketPairs: false,
        bracketPairsHorizontal: 'active' as const,
        highlightActiveBracketPair: true,
        indentation: true,
        highlightActiveIndentation: true,
      },
      stickyTabStops: false,
      codeLens: true,
      codeLensFontFamily: '',
      codeLensFontSize: 0,
      colorDecorators: true,
      colorDecoratorActivatedOn: 'clickAndHover' as const,
      colorDecoratorsLimit: 500,
      columnSelection: false,
      comments: {
        insertSpace: true,
        ignoreEmptyLines: true,
      },
      contextmenu: true,
      copyWithSyntaxHighlighting: true,
      cursorBlinking: 'blink' as const,
      cursorSmoothCaretAnimation: 'off' as const,
      cursorWidth: 0,
      disableLayerHinting: false,
      disableMonospaceOptimizations: false,
      domReadOnly: false,
      dragAndDrop: true,
      emptySelectionClipboard: true,
      dropIntoEditor: {
        enabled: true,
        showDropSelector: 'afterDrop' as const,
      },
      pasteAs: {
        enabled: true,
        showPasteSelector: 'afterPaste' as const,
      },
      parameterHints: {
        enabled: true,
        cycle: true,
      },
      renderFinalNewline: 'dimmed' as const,
      renderLineHighlight: 'line' as const,
      renderLineHighlightOnlyWhenFocus: false,
      renderValidationDecorations: 'editable' as const,
      renderWhitespace: 'selection' as const,
      revealHorizontalRightPadding: 15,
      rulers: [],
      scrollbar: {
        vertical: 'auto' as const,
        horizontal: 'auto' as const,
        verticalScrollbarSize: 14,
        horizontalScrollbarSize: 12,
        scrollByPage: false,
        ignoreHorizontalScrollbarInContentHeight: false,
      },
      scrollBeyondLastColumn: 4,
      scrollBeyondLastLine: true,
      scrollPredominantAxis: true,
      selectionClipboard: true,
      selectionHighlight: true,

      showFoldingControls: 'mouseover' as const,
      showUnused: true,
      showDeprecated: true,

      snippetSuggestions: 'inline' as const,
      smartSelect: {
        selectLeadingAndTrailingWhitespace: true,
        selectSubwords: true,
      },
      smoothScrolling: false,
      stopRenderingLineAfter: 10000,
      inlineEdit: {
        enabled: false,
        showToolbar: 'onHover' as const,
        fontFamily: 'default' as const,
      },
      inlineCompletionsAccessibilityVerbose: false,
      suggestFontSize: 0,
      suggestLineHeight: 0,
      suggestOnTriggerCharacters: true,
      suggestSelection: 'first' as const,
      tabCompletion: 'off' as const,
      tabIndex: 0, // Changed from 5 to 0
      unusualLineTerminators: 'prompt' as const,
      useShadowDOM: false, // Changed to false to allow CSS customization
      useTabStops: true,
      wordBreak: 'normal' as const,
      wordSegmenterLocales: [],
      wordSeparators: '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
      wordWrap: 'off' as const,
      wordWrapBreakAfterCharacters:
        ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣',
      wordWrapBreakBeforeCharacters: '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋',
      wordWrapColumn: 80,
      wordWrapOverride1: 'inherit' as const,
      wordWrapOverride2: 'inherit' as const,
      defaultColorDecorators: false,
      tabFocusMode: true,
      wrappingIndent: 'same' as const,
      wrappingStrategy: 'simple' as const,
    }),
    [],
  );

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monacoInstance: Monaco,
  ) => {
    editorRef.current = editorInstance;
    monacoInstance.editor.setTheme('hc-black'); // Set tema setelah mount

    // Allow all clipboard operations
    editorInstance.updateOptions({
      readOnly: true, // Keep read-only but allow copying
      copyWithSyntaxHighlighting: true,
    });

    // Add custom CSS to round the editor corners
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .monaco-editor {
        border-radius: 0.5rem;
       
      }
      .monaco-editor .overflow-guard {
        border-radius: 0.5rem;
         
      }
    `;
    document.head.appendChild(styleSheet);

    // Mencegah klik kanan
    editorInstance.onContextMenu((e: editor.IEditorMouseEvent) => {
      e.event.preventDefault();
    });
  };

  const copyCodeToClipboard = () => {
    if (editorRef.current) {
      const codeToCopy = editorRef.current.getValue();
      navigator.clipboard.writeText(codeToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative  rounded-lg">
      <div className="absolute top-2 right-2 z-50">
        <Button variant="outline" size="sm" onClick={copyCodeToClipboard}>
          {isCopied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>
      </div>
      <Editor
        className="z-10"
        height="600px"
        defaultLanguage="cpp"
        defaultValue={code}
        onMount={handleEditorDidMount}
        options={editorOptions}
      />
    </div>
  );
};

const CoolTabsTrigger: React.FC<React.ComponentProps<typeof TabsTrigger>> =
  React.forwardRef<
    React.ElementRef<typeof TabsTrigger>,
    React.ComponentPropsWithoutRef<typeof TabsTrigger> & {
      'data-state'?: 'active' | 'inactive';
    }
  >(({ className, children, ...props }, ref) => {
    return (
      <TabsTrigger
        {...props}
        ref={ref}
        className={cn(
          'relative text-sm font-medium transition-colors',
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5',
          'outline-none focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          'ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'border-2 border-black dark:border-white',
          'bg-background/50 data-[state=inactive]:dark:text-white data-[state=inactive]:dark:hover:text-slate-400/90 data-[state=inactive]:hover:border-slate-400/90  hover:text-white',
          'data-[state=active]:dark:border-white data-[state=active]:border-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
          className,
        )}
      >
        {children}
        <motion.div
          className="absolute inset-0 rounded-md bg-primary opacity-0 transition-opacity duration-200"
          style={{
            display: props['data-state'] === 'active' ? 'block' : 'none',
          }}
          layoutId="active-tab-background"
        />
      </TabsTrigger>
    );
  });
CoolTabsTrigger.displayName = 'CoolTabsTrigger';

export const DetailDevices: React.FC = () => {
  const codeExample = `// --- DEBUG FLAGS ---
// #define SOCKET_IO_DEBUG // Aktifkan ini untuk debugging Socket.IO (tidak digunakan dalam kode final)

// --- KONFIGURASI ---
#define EEPROM_SIZE 512 // Ukuran EEPROM yang digunakan untuk menyimpan konfigurasi

// Alamat EEPROM
#define ADDR_CONFIG_FLAG 0             // Alamat untuk flag yang menandakan konfigurasi valid
#define ADDR_SSID 1                  // Alamat untuk menyimpan SSID WiFi
#define ADDR_PASS 65                 // Alamat untuk menyimpan password WiFi
#define ADDR_USER_ID 129               // Alamat untuk menyimpan User ID
#define ADDR_DEVICE_CODE 193           // Alamat untuk menyimpan Device Code
#define ADDR_SOCKET_HOST 257            // Alamat untuk menyimpan host Socket.IO
#define ADDR_SOCKET_PORT 321            // Alamat untuk menyimpan port Socket.IO
#define ADDR_PH4_VOLTAGE_CALIB 323      // Alamat untuk menyimpan tegangan kalibrasi pH 4
#define ADDR_PH7_VOLTAGE_CALIB 327      // Alamat untuk menyimpan tegangan kalibrasi pH 7
#define ADDR_INTERVAL 331              // Alamat untuk menyimpan interval pengiriman data (dalam milidetik)

#define CONFIG_VALID_FLAG 0xAB       // Flag yang menandakan konfigurasi valid di EEPROM

const char* AP_SSID_PREFIX = "ESP32_IOT_"; // Prefix untuk SSID Access Point (AP)
char unique_ap_ssid[32];                   // Buffer untuk menyimpan SSID AP unik
const char* AP_PASS = "12345678";         // Password untuk AP

// --- INCLUDES ---
#include <WiFi.h>         // Library untuk koneksi WiFi
#include <WebServer.h>    // Library untuk membuat Web Server (untuk konfigurasi)
#include <EEPROM.h>       // Library untuk menyimpan data di EEPROM
#include <SocketIOclient.h> // Library untuk koneksi Socket.IO
#include <ArduinoJson.h>  // Library untuk memproses JSON
#include <OneWire.h>       // Library untuk komunikasi OneWire (untuk sensor suhu DS18B20)
#include <DallasTemperature.h> // Library untuk sensor suhu DS18B20
#include <Wire.h>          // Library untuk komunikasi I2C (untuk LCD)
#include <LiquidCrystal_I2C.h> // Library untuk LCD I2C
#include <NTPClient.h>    // Library untuk NTP (Network Time Protocol)
#include <WiFiUdp.h>      // Library untuk UDP (untuk NTP)
#include <time.h>         // Library untuk fungsi waktu standar

// --- Konfigurasi LCD ---
LiquidCrystal_I2C lcd(0x27, 16, 2); // Inisialisasi objek LCD I2C (Alamat I2C 0x27, 16 kolom, 2 baris)
bool lcdInitialized = false;           // Flag untuk menandakan apakah LCD sudah diinisialisasi

// --- Konfigurasi NTP ---
const char* NTP_SERVER = "pool.ntp.org"; // Server NTP yang digunakan
const long  GMT_OFFSET_SEC = 7 * 3600;  // Offset GMT dalam detik (GMT+7 untuk WIB)
const int   DAYLIGHT_OFFSET_SEC = 0;   // Offset Daylight Saving Time (DST) dalam detik
WiFiUDP ntpUDP;                          // Objek UDP untuk NTP
NTPClient timeClient(ntpUDP, NTP_SERVER, GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC); // Objek NTPClient

// --- GLOBALS ---
WebServer server(80);       // Objek WebServer di port 80
SocketIOclient socketIO;    // Objek SocketIOclient
struct Config {             // Struktur untuk menyimpan konfigurasi
  char ssid[64];            // SSID WiFi
  char password[64];        // Password WiFi
  char userId[64];          // User ID
  char deviceCode[64];      // Device Code
  char socketHost[64];      // Host Socket.IO
  uint16_t socketPort;       // Port Socket.IO
  float ph4_voltage_calib;  // Tegangan kalibrasi pH 4
  float ph7_voltage_calib;  // Tegangan kalibrasi pH 7
  uint32_t sendInterval;     // Interval pengiriman data (dalam milidetik)
  bool configured;         // Flag untuk menandakan apakah sudah dikonfigurasi
};
Config currentConfig;      // Variabel untuk menyimpan konfigurasi saat ini
bool isSocketConnected = false; // Flag untuk menandakan apakah Socket.IO terhubung
unsigned long lastSendDataTime = 0; // Waktu terakhir data dikirim
unsigned long lastSTACheckTime = 0; // Waktu terakhir koneksi STA (Station) dicek
const long staCheckInterval = 30000; // Interval pengecekan koneksi STA (30 detik)
const int oneWireBus = 17;           // Pin untuk bus OneWire (sensor suhu)
OneWire oneWire(oneWireBus);         // Objek OneWire
DallasTemperature sensors(&oneWire); // Objek DallasTemperature untuk sensor suhu
const int ph_pin = 35;               // Pin untuk sensor pH
const int turbidity_pin = 34;        // Pin untuk sensor kekeruhan
float last_read_tempC = -99.99;     // Suhu terakhir yang dibaca (Celsius), nilai default -99.99
float last_read_ph = -1.00;        // pH terakhir yang dibaca, nilai default -1.00
String last_read_ph_status = "N/A";  // Status pH terakhir yang dibaca, nilai default "N/A"
float last_read_turbidity_voltage = -1.0; // Tegangan kekeruhan terakhir yang dibaca, nilai default -1.0
unsigned long lastLcdUpdateTime = 0; // Waktu terakhir LCD diupdate
const long lcdUpdateInterval = 2000; // Interval update LCD (2 detik)

// --- FUNGSI EEPROM ---
void clearEEPROM() { // Fungsi untuk menghapus seluruh EEPROM
  Serial.println("[EEPROM] Clearing EEPROM...");
  for (int i = 0; i < EEPROM_SIZE; i++) EEPROM.write(i, 0); // Menulis 0 ke setiap alamat di EEPROM
  if (EEPROM.commit()) Serial.println("[EEPROM] Cleared successfully. Please restart."); // Menyimpan perubahan dan memberi tahu keberhasilan
  else Serial.println("[EEPROM_ERR] Failed to commit EEPROM clear."); // Menampilkan pesan kesalahan jika gagal
  delay(1000);
  ESP.restart(); // Restart ESP32 setelah menghapus EEPROM
}

void saveConfig() { // Fungsi untuk menyimpan konfigurasi ke EEPROM
  Serial.println("[EEPROM] Saving configuration...");
  EEPROM.write(ADDR_CONFIG_FLAG, CONFIG_VALID_FLAG); // Menulis flag validasi konfigurasi
  for (int i = 0; i < sizeof(currentConfig.ssid); ++i) EEPROM.write(ADDR_SSID + i, currentConfig.ssid[i]); // Menyimpan SSID
  for (int i = 0; i < sizeof(currentConfig.password); ++i) EEPROM.write(ADDR_PASS + i, currentConfig.password[i]); // Menyimpan password
  for (int i = 0; i < sizeof(currentConfig.userId); ++i) EEPROM.write(ADDR_USER_ID + i, currentConfig.userId[i]); // Menyimpan User ID
  for (int i = 0; i < sizeof(currentConfig.deviceCode); ++i) EEPROM.write(ADDR_DEVICE_CODE + i, currentConfig.deviceCode[i]); // Menyimpan Device Code
  for (int i = 0; i < sizeof(currentConfig.socketHost); ++i) EEPROM.write(ADDR_SOCKET_HOST + i, currentConfig.socketHost[i]); // Menyimpan host Socket.IO
  EEPROM.put(ADDR_SOCKET_PORT, currentConfig.socketPort); // Menyimpan port Socket.IO
  EEPROM.put(ADDR_PH4_VOLTAGE_CALIB, currentConfig.ph4_voltage_calib); // Menyimpan tegangan kalibrasi pH 4
  EEPROM.put(ADDR_PH7_VOLTAGE_CALIB, currentConfig.ph7_voltage_calib); // Menyimpan tegangan kalibrasi pH 7
  EEPROM.put(ADDR_INTERVAL, currentConfig.sendInterval); // Menyimpan interval pengiriman data
  if (EEPROM.commit()) Serial.println("[EEPROM] Configuration saved."); // Menyimpan perubahan dan memberi tahu keberhasilan
  else Serial.println("[EEPROM_ERR] Failed to commit configuration to EEPROM."); // Menampilkan pesan kesalahan jika gagal
}

void loadConfig() { // Fungsi untuk memuat konfigurasi dari EEPROM
  Serial.println("[EEPROM] Loading configuration...");
  if (EEPROM.read(ADDR_CONFIG_FLAG) == CONFIG_VALID_FLAG) { // Memeriksa apakah konfigurasi valid
    currentConfig.configured = true;
    for (int i = 0; i < sizeof(currentConfig.ssid); ++i) currentConfig.ssid[i] = EEPROM.read(ADDR_SSID + i); // Memuat SSID
    for (int i = 0; i < sizeof(currentConfig.password); ++i) currentConfig.password[i] = EEPROM.read(ADDR_PASS + i); // Memuat password
    for (int i = 0; i < sizeof(currentConfig.userId); ++i) currentConfig.userId[i] = EEPROM.read(ADDR_USER_ID + i); // Memuat User ID
    for (int i = 0; i < sizeof(currentConfig.deviceCode); ++i) currentConfig.deviceCode[i] = EEPROM.read(ADDR_DEVICE_CODE + i); // Memuat Device Code
    for (int i = 0; i < sizeof(currentConfig.socketHost); ++i) currentConfig.socketHost[i] = EEPROM.read(ADDR_SOCKET_HOST + i); // Memuat host Socket.IO
    EEPROM.get(ADDR_SOCKET_PORT, currentConfig.socketPort); // Memuat port Socket.IO
    EEPROM.get(ADDR_PH4_VOLTAGE_CALIB, currentConfig.ph4_voltage_calib); // Memuat tegangan kalibrasi pH 4
    EEPROM.get(ADDR_PH7_VOLTAGE_CALIB, currentConfig.ph7_voltage_calib); // Memuat tegangan kalibrasi pH 7
    EEPROM.get(ADDR_INTERVAL, currentConfig.sendInterval); // Memuat interval pengiriman data

    if (currentConfig.sendInterval < 500) currentConfig.sendInterval = 5000; // Memastikan interval pengiriman minimal 500ms
    if (isnan(currentConfig.ph4_voltage_calib) || currentConfig.ph4_voltage_calib == 0.0f) currentConfig.ph4_voltage_calib = 3.232f; // Memastikan nilai kalibrasi pH4 valid
    if (isnan(currentConfig.ph7_voltage_calib) || currentConfig.ph7_voltage_calib == 0.0f) currentConfig.ph7_voltage_calib = 2.601f; // Memastikan nilai kalibrasi pH7 valid

    Serial.println("[INFO] Configuration loaded from EEPROM:");
    Serial.print("  STA SSID:      "); Serial.println(currentConfig.ssid);
    Serial.print("  User ID:       "); Serial.println(currentConfig.userId);
    // ... (sisa print) - Bagian ini seharusnya dilengkapi dengan print informasi konfigurasi lainnya.
  } else { // Jika konfigurasi tidak valid
    Serial.println("[INFO] No valid config. Using defaults. PLEASE CALIBRATE AND SAVE!");
    currentConfig.configured = false;
    strcpy(currentConfig.socketHost, "192.168.1.100"); // Mengatur host Socket.IO default
    currentConfig.socketPort = 3001;                  // Mengatur port Socket.IO default
    currentConfig.ph4_voltage_calib = 3.232f;         // Mengatur tegangan kalibrasi pH 4 default
    currentConfig.ph7_voltage_calib = 2.601f;         // Mengatur tegangan kalibrasi pH 7 default
    currentConfig.sendInterval = 5000;                // Mengatur interval pengiriman data default (5 detik)
    strcpy(currentConfig.userId, "defaultUser");        // Mengatur User ID default
    strcpy(currentConfig.deviceCode, "ESP32DEV01");     // Mengatur Device Code default
  }
}

// --- WEB SERVER HANDLERS (Mode AP) ---
void handleRoot(); // Handler untuk halaman root (/)
void handleSave(); // Handler untuk menyimpan konfigurasi
void handleClear(); // Handler untuk menghapus konfigurasi

void handleRoot() { // Fungsi untuk menangani permintaan ke halaman root (/)
  String html = R"=====( // String HTML untuk halaman konfigurasi
<!DOCTYPE html><html><head><title>ESP32 IoT Config</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
  .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 500px; margin: auto; }
  h1 { color: #0056b3; text-align: center; }
  label { display: block; margin-bottom: 5px; font-weight: bold; }
  input[type='text'], input[type='password'], input[type='number'] { width: calc(100% - 22px); padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
  input[type='submit'] { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; }
  input[type='submit']:hover { background-color: #0056b3; }
  .note { font-size: 0.9em; color: #666; text-align: center; margin-top: 15px; }
  .warning { font-size: 0.9em; color: #c00; background-color: #fdd; padding: 5px; border: 1px solid #c00; border-radius:3px; margin-bottom:10px; }
  .status { margin-top: 20px; padding:10px; border: 1px solid #eee; border-radius: 4px; background-color: #f9f9f9; font-size: 0.9em;}
  .status strong { color: #0056b3; }
</style>
</head><body>
<div class="container">
  <h1>ESP32 IoT Device Configuration</h1>
  <p style="text-align:center; font-size:0.9em;">Connect to AP: <strong>{ap_ssid}</strong> (Pass: {ap_pass})<br>Then browse to http://{ap_ip}</p>
  <div class="status">
    <strong>STA WiFi Status:</strong> {wifi_status}<br>
    <strong>STA IP Address:</strong> {sta_ip}<br>
    <strong>Socket.IO Server:</strong> {socket_server_target}<br>
    <strong>Socket.IO Status:</strong> {socket_status}<br>
    <strong>Last pH Reading:</strong> {last_ph} ({last_ph_status})<br>
    <strong>Last Temperature:</strong> {last_temp} C<br>
    <strong>Last Turbidity (V):</strong> {last_turbidity_v} V
  </div>
  <form action='/save' method='POST'>
    <label for='ssid'>Target WiFi SSID:</label>
    <input type='text' id='ssid' name='ssid' value='{ssid_val}' required><br>
    <label for='pass'>Target WiFi Password:</label>
    <input type='password' id='pass' name='pass'><br>
    <label for='userid'>User ID:</label>
    <input type='text' id='userid' name='userid' value='{userid_val}' required><br>
    <label for='devicecode'>Device Code:</label>
    <input type='text' id='devicecode' name='devicecode' value='{devicecode_val}' required><br>
    <label for='sockhost'>Socket Server Host (IP):</label>
    <input type='text' id='sockhost' name='sockhost' value='{sockhost_val}' placeholder='e.g., 192.168.1.100' required><br>
    <label for='sockport'>Socket Server Port:</label>
    <input type='number' id='sockport' name='sockport' value='{sockport_val}' min='1' max='65535' required><br>
    <label for='interval'>Send Interval (ms):</label>
    <input type='number' id='interval' name='interval' value='{interval_val}' min='500' required><br>
    <hr><h3>pH Sensor Calibration</h3>
    <p class="warning"><strong>PENTING:</strong> Kalibrasi dengan mencelupkan probe ke larutan buffer standar (pH 4.01 & pH 7.00). Catat tegangan dari Serial Monitor. Pastikan Tegangan pH4 > Tegangan pH7.</p>
    <label for='ph4_v'>Voltage at pH 4.01:</label>
    <input type='number' step='0.001' id='ph4_v' name='ph4_v' value='{ph4_v_val}' required><br>
    <label for='ph7_v'>Voltage at pH 7.00:</label>
    <input type='number' step='0.001' id='ph7_v' name='ph7_v' value='{ph7_v_val}' required><br>
    <input type='submit' value='Save & Restart'>
  </form>
  <p class="note">ESP32 akan restart setelah menyimpan.</p>
  <form action='/clear' method='POST' style='margin-top: 20px;'>
    <input type='submit' value='Clear All Settings & Restart' style='background-color: #dc3545;'>
  </form>
</div>
</body></html>
)=====";

  html.replace("{ap_ssid}", String(unique_ap_ssid)); // Mengganti placeholder dengan SSID AP
  html.replace("{ap_pass}", String(AP_PASS)); // Mengganti placeholder dengan password AP
  html.replace("{ap_ip}", WiFi.softAPIP().toString()); // Mengganti placeholder dengan IP AP
  html.replace("{ssid_val}", currentConfig.configured ? String(currentConfig.ssid) : ""); // Mengganti placeholder dengan SSID yang tersimpan
  html.replace("{userid_val}", String(currentConfig.userId)); // Mengganti placeholder dengan User ID yang tersimpan
  html.replace("{devicecode_val}", String(currentConfig.deviceCode)); // Mengganti placeholder dengan Device Code yang tersimpan
  html.replace("{sockhost_val}", String(currentConfig.socketHost)); // Mengganti placeholder dengan host Socket.IO yang tersimpan
  html.replace("{sockport_val}", String(currentConfig.socketPort)); // Mengganti placeholder dengan port Socket.IO yang tersimpan
  html.replace("{interval_val}", String(currentConfig.sendInterval)); // Mengganti placeholder dengan interval pengiriman data yang tersimpan
  html.replace("{ph4_v_val}", String(currentConfig.ph4_voltage_calib, 3)); // Mengganti placeholder dengan tegangan kalibrasi pH 4 yang tersimpan (3 desimal)
  html.replace("{ph7_v_val}", String(currentConfig.ph7_voltage_calib, 3)); // Mengganti placeholder dengan tegangan kalibrasi pH 7 yang tersimpan (3 desimal)

  String wifiStatusStr = "Not Connected / Not Configured"; // Status WiFi default
  wl_status_t status = WiFi.status(); // Mendapatkan status WiFi
    if (strlen(currentConfig.ssid) > 0) { // Jika SSID sudah dikonfigurasi
        if (status == WL_CONNECTED) wifiStatusStr = "Connected to '" + String(WiFi.SSID()) + "'"; // Jika terhubung
        else if (status == WL_NO_SSID_AVAIL) wifiStatusStr = "SSID Not Found"; // Jika SSID tidak ditemukan
        else if (status == WL_CONNECT_FAILED) wifiStatusStr = "Connection Failed"; // Jika koneksi gagal
         else if (status == WL_IDLE_STATUS) wifiStatusStr = "Idle"; // Jika idle
         else if (status == WL_DISCONNECTED) wifiStatusStr = "Disconnected"; // Jika terputus
        else wifiStatusStr = "Connecting (" + String(status) +")..."; // Jika sedang menghubungkan
   }
  html.replace("{wifi_status}", wifiStatusStr); // Mengganti placeholder dengan status WiFi
  html.replace("{sta_ip}", status == WL_CONNECTED ? WiFi.localIP().toString() : "N/A"); // Mengganti placeholder dengan IP STA jika terhubung
  html.replace("{socket_server_target}", String(currentConfig.socketHost) + ":" + String(currentConfig.socketPort)); // Mengganti placeholder dengan target Socket.IO
  html.replace("{socket_status}", isSocketConnected ? "Connected" : "Not Connected"); // Mengganti placeholder dengan status Socket.IO
  html.replace("{last_ph}", last_read_ph <= -1.00 ? "N/A" : String(last_read_ph, 2)); // Mengganti placeholder dengan pH terakhir (2 desimal)
  html.replace("{last_ph_status}", last_read_ph_status); // Mengganti placeholder dengan status pH terakhir
  html.replace("{last_temp}", last_read_tempC == -99.99 ? "N/A" : String(last_read_tempC, 2)); // Mengganti placeholder dengan suhu terakhir (2 desimal)
  html.replace("{last_turbidity_v}", last_read_turbidity_voltage < 0.0 ? "N/A" : String(last_read_turbidity_voltage, 3)); // Mengganti placeholder dengan tegangan kekeruhan terakhir (3 desimal)
  server.send(200, "text/html", html); // Mengirim halaman HTML ke browser
}

void handleSave() { // Fungsi untuk menangani permintaan menyimpan konfigurasi
  if (server.hasArg("ssid")) strncpy(currentConfig.ssid, server.arg("ssid").c_str(), sizeof(currentConfig.ssid) - 1); // Menyimpan SSID
  if (server.hasArg("pass")) strncpy(currentConfig.password, server.arg("pass").c_str(), sizeof(currentConfig.password) - 1); // Menyimpan password
  if (server.hasArg("userid")) strncpy(currentConfig.userId, server.arg("userid").c_str(), sizeof(currentConfig.userId) - 1); // Menyimpan User ID
  if (server.hasArg("devicecode")) strncpy(currentConfig.deviceCode, server.arg("devicecode").c_str(), sizeof(currentConfig.deviceCode) - 1); // Menyimpan Device Code
  if (server.hasArg("sockhost")) strncpy(currentConfig.socketHost, server.arg("sockhost").c_str(), sizeof(currentConfig.socketHost) - 1); // Menyimpan host Socket.IO
  if (server.hasArg("sockport")) currentConfig.socketPort = server.arg("sockport").toInt(); // Menyimpan port Socket.IO
  if (server.hasArg("interval")) currentConfig.sendInterval = server.arg("interval").toInt(); // Menyimpan interval pengiriman data
  if (server.hasArg("ph4_v")) currentConfig.ph4_voltage_calib = server.arg("ph4_v").toFloat(); // Menyimpan tegangan kalibrasi pH 4
  if (server.hasArg("ph7_v")) currentConfig.ph7_voltage_calib = server.arg("ph7_v").toFloat(); // Menyimpan tegangan kalibrasi pH 7

  currentConfig.ssid[sizeof(currentConfig.ssid)-1] = '\0'; // Memastikan string SSID diakhiri null
  currentConfig.password[sizeof(currentConfig.password)-1] = '\0'; // Memastikan string password diakhiri null
  currentConfig.userId[sizeof(currentConfig.userId)-1] = '\0'; // Memastikan string User ID diakhiri null
  currentConfig.deviceCode[sizeof(currentConfig.deviceCode)-1] = '\0'; // Memastikan string Device Code diakhiri null
  currentConfig.socketHost[sizeof(currentConfig.socketHost)-1] = '\0'; // Memastikan string host Socket.IO diakhiri null

  if (strlen(currentConfig.ssid) == 0 || currentConfig.socketPort == 0 || currentConfig.ph4_voltage_calib == 0.0f || currentConfig.ph7_voltage_calib == 0.0f ) { // Validasi input
    server.send(400, "text/plain", "Bad Request: Required fields missing or invalid pH calibration values."); // Mengirim pesan kesalahan jika input tidak valid
    return;
  }
   if (currentConfig.sendInterval < 500) currentConfig.sendInterval = 500; // Memastikan interval pengiriman minimal 500ms

  if (currentConfig.ph4_voltage_calib <= currentConfig.ph7_voltage_calib) { // Validasi kalibrasi pH
      Serial.println("[WARN] CONFIG: pH4 Voltage is not GREATER than pH7 Voltage. Check values for correct pH calculation!"); // Menampilkan peringatan jika kalibrasi pH tidak valid
  }
  if (abs(currentConfig.ph4_voltage_calib - currentConfig.ph7_voltage_calib) < 0.1) { // Validasi kalibrasi pH
     Serial.println("[WARN] CONFIG: pH calibration voltages are very close. Check values for accurate readings."); // Menampilkan peringatan jika kalibrasi pH tidak valid
  }

  saveConfig(); // Menyimpan konfigurasi ke EEPROM
  String response = "<html><head><title>Config Saved</title><meta http-equiv='refresh' content='3;url=/'></head><body><h1>Configuration Saved!</h1><p>ESP32 will restart in 3 seconds...</p></body></html>"; // Respon HTML
  server.send(200, "text/html", response); // Mengirim respon ke browser
  delay(3000);
  ESP.restart(); // Restart ESP32
}

void handleClear() { // Fungsi untuk menangani permintaan menghapus konfigurasi
  clearEEPROM(); // Menghapus EEPROM
}

void startAPAndWebServer() { // Fungsi untuk memulai Access Point (AP) dan Web Server
  uint8_t mac[6]; // Array untuk menyimpan alamat MAC
  WiFi.macAddress(mac); // Mendapatkan alamat MAC
  sprintf(unique_ap_ssid, "%s%02X%02X", AP_SSID_PREFIX, mac[4], mac[5]); // Membuat SSID AP unik berdasarkan alamat MAC
  Serial.print("[WIFI_AP] Starting AP: "); Serial.println(unique_ap_ssid); // Menampilkan SSID AP
  WiFi.softAP(unique_ap_ssid, AP_PASS); // Memulai AP
  Serial.print("[WIFI_AP] IP: http://"); Serial.println(WiFi.softAPIP()); // Menampilkan IP AP
  server.on("/", HTTP_GET, handleRoot); // Menangani permintaan ke halaman root (/)
  server.on("/save", HTTP_POST, handleSave); // Menangani permintaan POST ke /save
  server.on("/clear", HTTP_POST, handleClear); // Menangani permintaan POST ke /clear
  server.begin(); // Memulai Web Server
  Serial.println("[WEB_SERVER] HTTP Web Server started on AP."); // Menampilkan pesan bahwa Web Server sudah dimulai
}

void connectToSTA() { // Fungsi untuk menghubungkan ke WiFi STA (Station)
  if (currentConfig.configured && strlen(currentConfig.ssid) > 0) { // Memeriksa apakah konfigurasi valid dan SSID tidak kosong
    if (WiFi.status() != WL_CONNECTED) { // Memeriksa apakah WiFi belum terhubung
      Serial.print("[WIFI_STA] Connecting to: '"); Serial.print(currentConfig.ssid); Serial.println("'"); // Menampilkan SSID yang akan dihubungkan
      WiFi.begin(currentConfig.ssid, currentConfig.password); // Memulai koneksi WiFi
      int attempts = 0; // Inisialisasi jumlah percobaan koneksi
      Serial.print("[WIFI_STA] Status: ");
      while (WiFi.status() != WL_CONNECTED && attempts < 20) { // Mencoba menghubungkan selama 20 percobaan
          delay(500); Serial.print("."); attempts++;
      }
      Serial.println();
      if (WiFi.status() == WL_CONNECTED) { // Jika berhasil terhubung
        Serial.println("[WIFI_STA] Connected! IP: " + WiFi.localIP().toString()); // Menampilkan IP
        timeClient.begin(); // Memulai NTP client
        timeClient.forceUpdate(); // Memaksa update waktu NTP
        Serial.println("[NTP] Time client (re)started. Current time: " + timeClient.getFormattedTime()); // Menampilkan waktu saat ini
        if (!socketIO.isConnected()) { // Memeriksa apakah Socket.IO belum terhubung
            Serial.printf("[SOCKET_IO] Connecting to: %s:%d\n", currentConfig.socketHost, currentConfig.socketPort); // Menampilkan target Socket.IO
            socketIO.begin(currentConfig.socketHost, currentConfig.socketPort, "/socket.io/?EIO=4"); // Memulai koneksi Socket.IO
            socketIO.onEvent(socketIOEvent); // Mengatur callback untuk event Socket.IO
        }
      } else { // Jika gagal terhubung
        Serial.print("[WIFI_STA_ERR] Failed to connect. Status: "); Serial.println(WiFi.status()); // Menampilkan status WiFi
        if (socketIO.isConnected()) socketIO.disconnect(); // Memutuskan koneksi Socket.IO jika terhubung
        isSocketConnected = false; // Mengatur flag koneksi Socket.IO
      }
    } else { // Sudah terhubung ke WiFi
       if (!timeClient.isTimeSet()) { // Memastikan NTP berjalan jika WiFi terhubung
           timeClient.begin();
           timeClient.forceUpdate();
           Serial.println("[NTP] Time client re-checked/started. Current time: " + timeClient.getFormattedTime());
       }
       if (!socketIO.isConnected() && strlen(currentConfig.socketHost) > 0 && currentConfig.socketPort > 0) { // Memeriksa apakah Socket.IO belum terhubung
            Serial.printf("[SOCKET_IO] WiFi connected, Socket.IO not. Connecting to: %s:%d\n", currentConfig.socketHost, currentConfig.socketPort); // Menampilkan target Socket.IO
            socketIO.begin(currentConfig.socketHost, currentConfig.socketPort, "/socket.io/?EIO=4"); // Memulai koneksi Socket.IO
            socketIO.onEvent(socketIOEvent); // Mengatur callback untuk event Socket.IO
        }
    }
  } else { // Jika konfigurasi tidak valid
    Serial.println("[WIFI_STA] Not configured. Skipping STA connection."); // Menampilkan pesan bahwa STA tidak dikonfigurasi
    if (socketIO.isConnected()) socketIO.disconnect(); // Memutuskan koneksi Socket.IO jika terhubung
    isSocketConnected = false; // Mengatur flag koneksi Socket.IO
  }
}

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) { // Fungsi callback untuk event Socket.IO
  switch(type) {
    case sIOtype_DISCONNECT: // Jika terputus
      Serial.println("[SOCKET_IO] Disconnected."); // Menampilkan pesan terputus
      isSocketConnected = false; // Mengatur flag koneksi Socket.IO
      break;
    case sIOtype_CONNECT: // Jika terhubung
      Serial.print("[SOCKET_IO] Connected! URL: "); Serial.println((char*)payload); // Menampilkan URL koneksi
      isSocketConnected = true; // Mengatur flag koneksi Socket.IO
      socketIO.send(sIOtype_CONNECT, "/"); // Mengirim event CONNECT ke server
      break;
    case sIOtype_EVENT: // Jika menerima event
      Serial.printf("[SOCKET_IO_RX] Event: %s\n", payload); // Menampilkan payload event
      break;
    case sIOtype_ACK: // Jika menerima ACK
      Serial.printf("[SOCKET_IO_RX] ACK len: %u\n", length); // Menampilkan panjang ACK
      break;
    case sIOtype_ERROR: // Jika terjadi error
      Serial.printf("[SOCKET_IO_ERR] Error len: %u. Payload: %s\n", length, (char*)payload); // Menampilkan pesan error
      isSocketConnected = false; // Mengatur flag koneksi Socket.IO
      break;
     case sIOtype_BINARY_EVENT: Serial.println("[SOCKET_IO_RX] Received binary event."); break; // Jika menerima binary event
     case sIOtype_BINARY_ACK: Serial.println("[SOCKET_IO_RX] Received binary ACK."); break; // Jika menerima binary ACK
     default: Serial.printf("[SOCKET_IO_RX] Received unknown message type: %d\n", type); break; // Jika menerima tipe pesan tidak dikenal
  }
}

void readAllSensors() { // Fungsi untuk membaca semua sensor
  int raw_ph_adc = analogRead(ph_pin); // Membaca nilai ADC sensor pH
  double voltage_ph = (3.3 / 4095.0) * raw_ph_adc; // Mengkonversi nilai ADC ke tegangan

   if (abs(currentConfig.ph4_voltage_calib - currentConfig.ph7_voltage_calib) < 0.1) { // Validasi kalibrasi pH
      last_read_ph = -1.01; // Mengatur pH menjadi -1.01 jika kalibrasi tidak valid
   } else if (currentConfig.ph4_voltage_calib <= currentConfig.ph7_voltage_calib) { // Validasi kalibrasi pH
       last_read_ph = -1.02; // Mengatur pH menjadi -1.02 jika kalibrasi tidak valid
   } else {
      if (voltage_ph > (currentConfig.ph4_voltage_calib + 0.05) ) { // Memeriksa apakah tegangan melebihi kalibrasi pH 4
          last_read_ph = 0.0; // Mengatur pH menjadi 0 jika tegangan terlalu tinggi
      } else if (voltage_ph < (currentConfig.ph7_voltage_calib - 0.5)) { // Memeriksa apakah tegangan kurang dari kalibrasi pH 7
          last_read_ph = 14.0; // Mengatur pH menjadi 14 jika tegangan terlalu rendah
      }
      else {
          float ph_step_calc = (currentConfig.ph4_voltage_calib - currentConfig.ph7_voltage_calib) / 3.0f; // Menghitung langkah pH

          if (abs(ph_step_calc) < 0.001f) { // Memeriksa apakah langkah pH terlalu kecil
             last_read_ph = -1.03; // Mengatur pH menjadi -1.03 jika langkah terlalu kecil
          } else {
              float calculated_ph = 7.00f + ((currentConfig.ph7_voltage_calib - voltage_ph) / ph_step_calc); // Menghitung pH
              last_read_ph = constrain(calculated_ph, 0.0, 14.0); // Membatasi nilai pH antara 0 dan 14
          }
      }
   }

  if (last_read_ph <= -1.00) last_read_ph_status = "Err Kalibrasi"; // Mengatur status pH jika error kalibrasi
  else if (last_read_ph > 7.8) last_read_ph_status = "Sangat Basa"; // Mengatur status pH jika sangat basa
  else if (last_read_ph > 7.2) last_read_ph_status = "Basa Ringan"; // Mengatur status pH jika basa ringan
  else if (last_read_ph < 6.2) last_read_ph_status = "Sangat Asam"; // Mengatur status pH jika sangat asam
  else if (last_read_ph < 6.8) last_read_ph_status = "Asam Ringan"; // Mengatur status pH jika asam ringan
  else last_read_ph_status = "Netral"; // Mengatur status pH jika netral

  sensors.requestTemperatures(); // Meminta pembacaan suhu
  float temp_c = sensors.getTempCByIndex(0); // Membaca suhu dari sensor
  if (temp_c == DEVICE_DISCONNECTED_C || temp_c == 85.0 || temp_c == -127.0) { // Memeriksa apakah sensor terputus atau error
    last_read_tempC = -99.99; // Mengatur suhu menjadi -99.99 jika error
  } else {
    last_read_tempC = temp_c; // Menyimpan suhu yang dibaca
  }

  int raw_turbidity_adc = analogRead(turbidity_pin); // Membaca nilai ADC sensor kekeruhan
  last_read_turbidity_voltage = (3.3 / 4095.0) * raw_turbidity_adc; // Mengkonversi nilai ADC ke tegangan
  if (last_read_turbidity_voltage < 0) last_read_turbidity_voltage = -1.0; // Memastikan tegangan kekeruhan tidak negatif

   Serial.printf("[SENSOR_DATA] Temp:%.2f C, pH:%.2f (%s), Turb(V):%.3f V, V_pH:%.3f V\n", // Menampilkan data sensor
                last_read_tempC,
                (last_read_ph <= -1.00 ? -1.00 : last_read_ph),
                last_read_ph_status.c_str(),
                last_read_turbidity_voltage,
                voltage_ph );
}

void sendSensorData() { // Fungsi untuk mengirim data sensor ke server
  if (!isSocketConnected || WiFi.status() != WL_CONNECTED) return; // Memeriksa apakah Socket.IO terhubung dan WiFi terhubung
  readAllSensors(); // Membaca semua sensor
  DynamicJsonDocument doc(300); // Membuat dokumen JSON
  doc["userId"] = currentConfig.userId; // Menambahkan User ID ke dokumen JSON
  doc["deviceCode"] = currentConfig.deviceCode; // Menambahkan Device Code ke dokumen JSON
  JsonObject dataSensor = doc.createNestedObject("dataSensor"); // Membuat objek JSON "dataSensor"

  if (last_read_tempC == -99.99) { // Memeriksa apakah suhu error
    dataSensor["temperatureWater"] = nullptr; // Menambahkan null ke "temperatureWater" jika error
  } else {
    dataSensor["temperatureWater"] = last_read_tempC; // Menambahkan suhu ke "temperatureWater"
  }

  if (last_read_ph <= -1.00) { // Memeriksa apakah pH error
    dataSensor["phWater"] = nullptr; // Menambahkan null ke "phWater" jika error
  } else {
    dataSensor["phWater"] = last_read_ph; // Menambahkan pH ke "phWater"
  }

  if (last_read_turbidity_voltage < 0.0) { // Memeriksa apakah tegangan kekeruhan error
    dataSensor["turbidityWater"] = nullptr; // Menambahkan null ke "turbidityWater" jika error
  } else {
    dataSensor["turbidityWater"] = last_read_turbidity_voltage; // Menambahkan tegangan kekeruhan ke "turbidityWater"
  }

  String output_payload_json; // String untuk menyimpan payload JSON
  serializeJson(doc, output_payload_json); // Mengkonversi dokumen JSON ke string
  String eventName = "iot-data"; // Nama event Socket.IO
  String full_socket_io_message = "[\"" + eventName + "\"," + output_payload_json + "]"; // Membuat pesan Socket.IO lengkap
  Serial.print("[SOCKET_IO_TX] Sending: "); Serial.println(full_socket_io_message); // Menampilkan pesan yang akan dikirim
  if (!socketIO.send(sIOtype_EVENT, full_socket_io_message.c_str())) { // Mengirim pesan Socket.IO
    Serial.println("[SOCKET_IO_TX_ERR] Failed to send event!"); // Menampilkan pesan error jika gagal mengirim
  }
}

void initLcd() { // Fungsi untuk menginisialisasi LCD
  Wire.begin(); // Memulai komunikasi I2C
  lcd.init(); // Menginisialisasi LCD
  lcd.backlight(); // Menyalakan backlight LCD
  lcdInitialized = true; // Mengatur flag LCD diinisialisasi
  lcd.clear(); // Membersihkan layar LCD
  lcd.setCursor(0, 0); // Mengatur kursor ke posisi (0, 0)
  lcd.print("Initializing..."); // Menampilkan pesan inisialisasi
  Serial.println("[LCD] Initialized."); // Menampilkan pesan LCD diinisialisasi
}

void updateLcdDisplay() { // Fungsi untuk mengupdate tampilan LCD
  if (!lcdInitialized) return; // Memeriksa apakah LCD sudah diinisialisasi

  lcd.clear(); // Membersihkan layar LCD

  if (!isSocketConnected) { // Memeriksa apakah Socket.IO tidak terhubung
    lcd.setCursor(0, 0); // Mengatur kursor ke posisi (0, 0)
    lcd.print("DEVICE BELUM"); // Menampilkan pesan
    lcd.setCursor(0, 1); // Mengatur kursor ke posisi (0, 1)
    lcd.print("TERHUBUNG"); // Menampilkan pesan
    return; // Tidak menampilkan data sensor jika tidak terhubung
  }

  // Jika socket terhubung, menampilkan waktu dan data sensor
  // Baris 1: Waktu (HH:MM) dan pH (X.XX)
  if (WiFi.status() == WL_CONNECTED) { // Seharusnya selalu true jika isSocketConnected adalah true
      timeClient.update(); // Update waktu dari server NTP
      
      time_t epochTime = timeClient.getEpochTime(); // Get epoch time as time_t
      struct tm *ptm = localtime(&epochTime); // Convert epoch to tm struct
      
      char timeString[6]; // Buffer untuk "HH:MM" (5 chars + null)
      
      if (ptm) { // Cek jika konversi localtime berhasil
          strftime(timeString, sizeof(timeString), "%H:%M", ptm);
      } else {
          strcpy(timeString, "TMERR"); // Fallback jika localtime gagal
      }

      char line1[17]; // 16 chars untuk baris LCD + null
      String phStr = (last_read_ph <= -1.00 ? "ERR" : String(last_read_ph, 2)); // pH dengan 2 desimal
      // Pastikan phStr muat (max 5 chars untuk X.XX atau XX.X, atau 3 untuk ERR)
      if (phStr.length() > 5) phStr = phStr.substring(0,5); 

      snprintf(line1, sizeof(line1), "%s pH:%s", timeString, phStr.c_str() );
      lcd.setCursor(0,0);
      lcd.print(line1);

  } else { 
      // Kasus ini idealnya tidak akan tercapai jika isSocketConnected adalah true
      char line1_err[17];
      String phStr = (last_read_ph <= -1.00 ? "ERR" : String(last_read_ph, 2));
      if (phStr.length() > 5) phStr = phStr.substring(0,5);

      snprintf(line1_err, sizeof(line1_err), "WiFiER pH:%s", phStr.c_str()); // Dipendekkan "WiFi ERR"
      lcd.setCursor(0,0);
      lcd.print(line1_err);
  }

  // Baris 2: Suhu (X.X) dan Kekeruhan (X.XX V)
  char line2[17];
  String tempStr = (last_read_tempC == -99.99 ? "ERR" : String(last_read_tempC, 1));
  if (tempStr.length() > 4) tempStr = tempStr.substring(0,4); // Max 4 chars: -X.X atau XX.X atau ERR

  String turbStr = (last_read_turbidity_voltage < 0.0 ? "ERR" : String(last_read_turbidity_voltage, 2)); // Tegangan kekeruhan dengan 2 desimal
  // Pastikan turbStr muat (max 4 chars untuk X.XX atau 3 untuk ERR)
   if (turbStr.length() > 4) turbStr = turbStr.substring(0,4); 


  snprintf(line2, sizeof(line2), "T:%s Trb:%s", tempStr.c_str(), turbStr.c_str());
  lcd.setCursor(0, 1);
  lcd.print(line2);
}


void setup() { // Fungsi setup (dijalankan sekali saat boot)
  Serial.begin(115200); // Memulai serial komunikasi
  while (!Serial); // Menunggu serial terhubung
  Serial.println("\n\n[SYSTEM] ESP32 IoT Node Booting (LCD Version)..."); // Menampilkan pesan boot

  initLcd(); // Menginisialisasi LCD
  lcd.setCursor(0,0); // Mengatur kursor ke posisi (0, 0)
  lcd.print("Booting ESP32..."); // Menampilkan pesan boot
  lcd.setCursor(0,1); // Mengatur kursor ke posisi (0, 1)
  lcd.print("Please Wait..."); // Menampilkan pesan tunggu

  if (!EEPROM.begin(EEPROM_SIZE)) { // Memulai EEPROM
    Serial.println("[SYSTEM_ERR] Failed to initialise EEPROM! Halted."); // Menampilkan pesan error jika gagal
    if(lcdInitialized) { lcd.clear(); lcd.print("EEPROM Fail!"); } // Menampilkan pesan error di LCD jika LCD sudah diinisialisasi
    while (1) delay(1000); // Looping tanpa henti
  }
  loadConfig(); // Memuat konfigurasi dari EEPROM

  sensors.begin(); // Memulai sensor suhu
  Serial.println("[SENSOR] DS18B20 initialized."); // Menampilkan pesan sensor suhu diinisialisasi

  WiFi.mode(WIFI_AP_STA); // Mengatur mode WiFi menjadi AP dan STA
  startAPAndWebServer(); // Memulai AP dan Web Server

  if(lcdInitialized){ // Jika LCD sudah diinisialisasi
    lcd.clear(); // Membersihkan layar LCD
    lcd.print("Connecting WiFi"); // Menampilkan pesan menghubungkan WiFi
    lcd.setCursor(0,1); // Mengatur kursor ke posisi (0, 1)
    if(strlen(currentConfig.ssid) > 0) lcd.print(currentConfig.ssid); // Menampilkan SSID jika ada
    else lcd.print("Not Configured"); // Menampilkan pesan belum dikonfigurasi jika tidak ada SSID
  }
  connectToSTA(); // Mencoba menghubungkan ke WiFi STA (jika dikonfigurasi) // Inisialisasi NTP client di dalam fungsi ini jika koneksi WiFi berhasil

  lastSTACheckTime = millis(); // Menyimpan waktu terakhir pengecekan koneksi STA
  lastSendDataTime = millis() - currentConfig.sendInterval + 3000; // Memastikan pengiriman data pertama segera terjadi
  lastLcdUpdateTime = millis(); // Menyimpan waktu terakhir update LCD
  readAllSensors();      // Pembacaan sensor awal
  updateLcdDisplay();    // Update LCD awal
  Serial.println("[SYSTEM] Setup complete. Entering main loop."); // Menampilkan pesan setup selesai
}

void loop() { // Fungsi loop (dijalankan berulang kali)
  server.handleClient(); // Menangani client Web Server

  if (currentConfig.configured && strlen(currentConfig.ssid) > 0 && WiFi.status() != WL_CONNECTED) { // Memeriksa apakah STA dikonfigurasi dan tidak terhubung
    if (millis() - lastSTACheckTime > staCheckInterval) { // Memeriksa apakah sudah waktunya untuk mencoba menghubungkan kembali ke STA
      Serial.println("[WIFI_STA] Periodically retrying STA connection..."); // Menampilkan pesan mencoba menghubungkan kembali
      if(lcdInitialized && !isSocketConnected) {  // Jika LCD diinisialisasi dan socket tidak terhubung
          lcd.clear();
          lcd.setCursor(0,0); lcd.print("Retrying WiFi..."); // Menampilkan pesan mencoba menghubungkan WiFi
          lcd.setCursor(0,1); 
          if(strlen(currentConfig.ssid) > 16) {  // Jika SSID terlalu panjang untuk ditampilkan di LCD
            char shortSSID[17];
            strncpy(shortSSID, currentConfig.ssid, 16); // Menyalin sebagian SSID
            shortSSID[16] = '\0'; // Menambahkan null terminator
            lcd.print(shortSSID); // Menampilkan SSID yang dipendekkan
          } else {
            lcd.print(currentConfig.ssid); // Menampilkan SSID
          }
      }
      connectToSTA(); // Mencoba menghubungkan ke STA
      lastSTACheckTime = millis(); // Mengupdate waktu terakhir pengecekan koneksi STA
    }
  }

  if (WiFi.status() == WL_CONNECTED) { // Memeriksa apakah WiFi terhubung
    socketIO.loop();  // Menjalankan loop Socket.IO
    if (isSocketConnected && (millis() - lastSendDataTime >= currentConfig.sendInterval)) { // Memeriksa apakah Socket.IO terhubung dan sudah waktunya mengirim data
      lastSendDataTime = millis(); // Mengupdate waktu terakhir pengiriman data
      sendSensorData();  // Mengirim data sensor
    }
  } else {  // Jika WiFi tidak terhubung
    if (isSocketConnected) {  // Jika Socket.IO sebelumnya terhubung
      Serial.println("[WIFI_STA_WARN] STA WiFi lost. Marking Socket.IO disconnected."); // Menampilkan pesan WiFi terputus
      isSocketConnected = false;  // Mengatur flag Socket.IO terputus
    }
  }

  if (millis() - lastLcdUpdateTime >= lcdUpdateInterval) { // Memeriksa apakah sudah waktunya mengupdate LCD
    lastLcdUpdateTime = millis(); // Mengupdate waktu terakhir update LCD
    if (isSocketConnected && WiFi.status() == WL_CONNECTED) {  // Jika socket terhubung dan WiFi terhubung
        readAllSensors();  // Membaca semua sensor
    }
    updateLcdDisplay();  // Mengupdate tampilan LCD
  }
}`.trim();
  const t = useTranslations('landingPage.DIYSection');
  return (
    <section className=" max-w-7xl mb-10 container mx-auto  min-h-[50vh] lg:min-h-screen bg-dot-white/[0.2] dark:bg-dot-white/[0.2] flex flex-col items-center gap-5 mt-20 p-4">
      <div className="flex text-center flex-col items-center gap-2 mb-5">
        <h1 className="text-3xl text-center font-bold">{t('title')}</h1>
        <p className="text-base max-w-2xl px-4 md:px-20 text-black dark:text-white">
          {t('description')}
        </p>
      </div>
      <div className="w-full">
        <Tabs
          defaultValue="code"
          className=" flex flex-col md:grid  md:grid-cols-4 w-full gap-5"
        >
          <TabsList className="flex md:grid bg-transparent h-[45px] md:h-[100px] w-full  rounded-lg  grid-rows-2 col-span-1 gap-2">
            <CoolTabsTrigger className="w-[150px] py-2 gap-5" value="code">
              <span>
                <FaCode size={25} />
              </span>
              <span className="hidden md:inline">{t('codeButton')}</span>
            </CoolTabsTrigger>
            <CoolTabsTrigger className="w-[150px] py-2 gap-5 " value="3d">
              <span>
                <TbHexagon3D size={25} />
              </span>
              <span className="hidden md:inline font-extrabold text-md">
                {t('designButton')}
              </span>
            </CoolTabsTrigger>
          </TabsList>
          <TabsContent className="col-span-3 w-full " value="code">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MonacoEditor code={codeExample} />
            </motion.div>
          </TabsContent>

          <TabsContent className="col-span-3 w-full" value="3d">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <ThreeSceneWrapper />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DetailDevices;

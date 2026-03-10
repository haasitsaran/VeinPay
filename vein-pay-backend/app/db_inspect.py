import sqlite3


def main() -> None:
    con = sqlite3.connect("veinpay.db")
    cur = con.cursor()
    cols = [r[1] for r in cur.execute("PRAGMA table_info(users)").fetchall()]
    print("cols:", cols)
    rows = cur.execute(
        "SELECT id, username, role, length(biometric_template), length(palm_signature) "
        "FROM users ORDER BY id DESC LIMIT 10"
    ).fetchall()
    print("last users:", rows)
    con.close()


if __name__ == "__main__":
    main()


"""Builds practice-workbook.xlsx: the same data as the Excel lab, ready to practise the tracks in real Excel.
Sheets: Read me, Data (an Excel Table named SalesData), Summary (SUMIFS formulas by month), Halloween (running totals
from Chapter 2 plus formulas that derive arrivals per time slot). Run from anywhere: python3 make_workbook.py"""
import json, os, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'practice-workbook.xlsx')
D = json.load(open(os.path.join(HERE, 'dataset.json')))
F = 'Arial'
body = Font(name=F, size=11)
bold = Font(name=F, size=11, bold=True)
head = Font(name=F, size=11, bold=True, color='FFFFFF')
title = Font(name=F, size=14, bold=True)
note = Font(name=F, size=11, italic=True, color='595959')
fill_head = PatternFill('solid', fgColor='2F5597')
thin = Side(style='thin', color='BFBFBF')

wb = Workbook()

# ---------- Read me ----------
rm = wb.active
rm.title = 'Read me'
rows = [
    ('Practice-Store.xlsx · Data Visualization Excel lab', title),
    ('Fictional office-supplies store, Malaysia, 2024–2025: 364 orders. Same data as the Excel lab and SQL lab on the site.', body),
    ('', body),
    ('Sheets', bold),
    ('Data: one row per order, formatted as an Excel Table named SalesData. Use it for PivotTables, slicers and the histogram.', body),
    ('Summary: monthly sales by category built with SUMIFS formulas. Use it for the line, column and combo chart track.', body),
    ('Halloween: the Chapter 2 data set. Columns B–G are running totals; columns I–N use formulas to get arrivals per time slot.', body),
    ('', body),
    ('Tracks (same steps as on the site)', bold),
    ('1 · Charts: on Summary select A1:F25 ▸ Insert ▸ Line. Add a message title, remove gridlines, try Clustered Column and Switch Row/Column, then Insert ▸ Combo with Margin % on the secondary axis. On Data, select column L ▸ Insert ▸ Statistic Chart ▸ Histogram.', body),
    ('2 · PivotTable: click inside Data ▸ Insert ▸ PivotTable ▸ New Worksheet. Category to Rows, Sales to Values, Region to Columns. Value Field Settings ▸ Show Values As ▸ % of Grand Total. Sort Largest to Smallest. Then group OrderDate by Years and Quarters.', body),
    ('3 · PivotChart, slicer, timeline: PivotTable Analyze ▸ PivotChart; Insert Slicer ▸ Region; Ctrl+click two regions; Insert Timeline ▸ OrderDate ▸ YEARS ▸ 2025; clear the slicer.', body),
    ('4 · Report Connections: make a second PivotTable (OrderDate in Rows, Sales in Values). Select the slicer ▸ Slicer ▸ Report Connections ▸ tick both PivotTables.', body),
    ('5 · Dashboard: add a sheet named Dashboard; Chart Design ▸ Move Chart for each PivotChart; cut and paste the slicer; type = and click a PivotTable Grand Total for a GETPIVOTDATA KPI; View ▸ untick Gridlines; change a Sales value on Data, then Data ▸ Refresh All.', body),
    ('', body),
    ('Tip: PivotTables do not recalculate like formulas. After changing Data, use Data ▸ Refresh All (Ctrl+Alt+F5).', note),
]
for i, (t, f) in enumerate(rows, 1):
    c = rm.cell(row=i, column=1, value=t)
    c.font = f
    c.alignment = Alignment(wrap_text=True, vertical='top')
rm.column_dimensions['A'].width = 120
rm.sheet_view.showGridLines = False

# ---------- Data ----------
ws = wb.create_sheet('Data')
cols = D['cols']
ws.append(cols)
for r in D['rows']:
    r = list(r)
    r[1] = dt.date.fromisoformat(r[1])
    ws.append(r)
n = len(D['rows']) + 1
fmt = {'OrderDate': 'yyyy-mm-dd', 'Units': '0', 'UnitPrice': '#,##0.00', 'Discount': '0%', 'Sales': '#,##0.00', 'Profit': '#,##0.00;[Red]-#,##0.00', 'ShipDays': '0'}
widths = {'OrderID': 10, 'OrderDate': 12, 'Region': 14, 'State': 16, 'Segment': 13, 'Channel': 10, 'Category': 16, 'SubCategory': 14, 'Units': 8, 'UnitPrice': 11, 'Discount': 10, 'Sales': 12, 'Profit': 12, 'ShipDays': 10}
for j, c in enumerate(cols, 1):
    L = get_column_letter(j)
    ws.column_dimensions[L].width = widths.get(c, 12)
    for i in range(1, n + 1):
        cell = ws.cell(row=i, column=j)
        cell.font = bold if i == 1 else body
        if i > 1 and c in fmt:
            cell.number_format = fmt[c]
tab = Table(displayName='SalesData', ref=f'A1:{get_column_letter(len(cols))}{n}')
tab.tableStyleInfo = TableStyleInfo(name='TableStyleMedium2', showRowStripes=True)
ws.add_table(tab)
ws.freeze_panes = 'A2'

# ---------- Summary ----------
sm = wb.create_sheet('Summary')
hdr = ['Month', 'Furniture', 'Office Supplies', 'Technology', 'Total Sales', 'Margin %']
sm.append(hdr)
months = [dt.date(y, m, 1) for y in (2024, 2025) for m in range(1, 13)]
rng = lambda c: f"Data!${c}$2:${c}${n}"
for i, mth in enumerate(months, 2):
    sm.cell(row=i, column=1, value=mth).number_format = 'mmm yy'
    for j in (2, 3, 4):
        L = get_column_letter(j)
        sm.cell(row=i, column=j, value=f'=SUMIFS({rng("L")},{rng("G")},{L}$1,{rng("B")},">="&$A{i},{rng("B")},"<"&EDATE($A{i},1))').number_format = '#,##0'
    sm.cell(row=i, column=5, value=f'=SUM(B{i}:D{i})').number_format = '#,##0'
    sm.cell(row=i, column=6, value=f'=IFERROR(SUMIFS({rng("M")},{rng("B")},">="&$A{i},{rng("B")},"<"&EDATE($A{i},1))/E{i},0)').number_format = '0.0%'
last = len(months) + 1
tot = last + 1
sm.cell(row=tot, column=1, value='Total')
for j in (2, 3, 4, 5):
    L = get_column_letter(j)
    sm.cell(row=tot, column=j, value=f'=SUM({L}2:{L}{last})').number_format = '#,##0'
sm.cell(row=tot, column=6, value=f'=IFERROR(SUM({rng("M")})/E{tot},0)').number_format = '0.0%'
for r in sm.iter_rows(min_row=1, max_row=tot, max_col=6):
    for c in r:
        c.font = bold if c.row in (1, tot) else body
for j in range(1, 7):
    sm.cell(row=1, column=j).fill = fill_head
    sm.cell(row=1, column=j).font = head
    sm.column_dimensions[get_column_letter(j)].width = 16
sm.cell(row=tot + 2, column=1, value='Columns B–D: SUMIFS of Data!Sales by category and month. Column F: profit ÷ sales for the month. Formulas update instantly; PivotTables need Refresh.').font = note
sm.freeze_panes = 'B2'

# ---------- Halloween ----------
hw = wb.create_sheet('Halloween')
H = {2016: [22, 160, 386, 612, 759, 822], 2015: [13, 148, 336, 523, 667, 747], 2014: [0, 106, 197, 321, 436, 454], 2013: [33, 152, 233, 303, 371, 391],
     2012: [0, 147, 310, 542, 653, 673], 2011: [0, 172, 367, 619, 816, 869], 2010: [0, 172, 351, 538, 723, 726], 2009: [0, 52, 229, 379, 522, 542], 2008: [0, 75, 192, 339, 483, 492]}
hw.append(['Year', '6pm', '6:30pm', '7pm', '7:30pm', '8pm', 'Total (8:15pm)', None, 'By 6pm', '6–6:30pm', '6:30–7pm', '7–7:30pm', '7:30–8pm', '8–8:15pm'])
for k, y in enumerate(sorted(H, reverse=True), 2):
    hw.cell(row=k, column=1, value=y)
    for j, v in enumerate(H[y], 2):
        hw.cell(row=k, column=j, value=v)
    hw.cell(row=k, column=9, value=f'=B{k}')
    for j in range(10, 15):
        a, b = get_column_letter(j - 7), get_column_letter(j - 8)
        hw.cell(row=k, column=j, value=f'={a}{k}-{b}{k}')
for r in hw.iter_rows(min_row=1, max_row=10, max_col=14):
    for c in r:
        c.font = bold if c.row == 1 else body
for j in list(range(1, 8)) + list(range(9, 15)):
    hw.cell(row=1, column=j).fill = fill_head
    hw.cell(row=1, column=j).font = head
    hw.column_dimensions[get_column_letter(j)].width = 13
hw.column_dimensions['H'].width = 3
hw.cell(row=12, column=1, value='Source: Halloween data set, Chapter 2 (The Fundamentals of Data Visualization, Jeffrey A. Shaffer). Columns B–G are running totals by that time.').font = note
hw.cell(row=13, column=1, value='Columns I–N are formulas: arrivals in each slot = later running total − earlier running total. Years are newest first, as on the slide: sort A→Z before charting so time runs left to right.').font = note
wb.active = 0
wb.save(OUT)
print('saved', OUT)

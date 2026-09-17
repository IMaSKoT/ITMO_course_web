n, m = map(int, input().split())
a = []
for i in range(n):
    a.append(input().split())
x = 0
y = m - 1
while m != 0 and n != 0:
    for i in range(m):
        print(a[x][i])
    for i in range(n - 1):
        print(a[i + 1][y])
    for i in range(m - 1):
        print(a[n - 1 - x][y])
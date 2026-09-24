def permutations(arr):
    n = len(arr)
    used = [False] * n
    cnt = 0

    def gen(cur):
        nonlocal cnt
        if len(cur) == n:
            flag = 0
            for i in range(len(cur)):
                if cur[i] % (i + 1) == 0 or (i + 1) % cur[i] == 0:
                    flag += 1
            if flag == n:
                cnt += 1
            return
        for i in range(n):
            if not used[i]:
                used[i] = True
                cur.append(arr[i])
                gen(cur)
                cur.pop()
                used[i] = False

    gen([])
    return cnt

print(permutations([1, 2, 3]))